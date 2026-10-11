import os
import stripe
from dotenv import load_dotenv

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Order, Cart, Product, User
from .schemas import OrderResponse
from .security import decode_access_token


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()


# =====================================================
# STRIPE CONFIGURATION
# =====================================================

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

security = HTTPBearer()


# =====================================================
# DATABASE DEPENDENCY
# =====================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =====================================================
# CURRENT USER
# =====================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =====================================================
# CREATE ORDER
# =====================================================

@router.post("/", response_model=OrderResponse)
def create_order(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_items = db.query(Cart).filter(
        Cart.user_id == current_user.id
    ).all()

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total_amount = 0

    for item in cart_items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        total_amount += product.price * item.quantity

    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="Pending"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


# =====================================================
# GET ORDERS
# =====================================================

@router.get("/", response_model=list[OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).all()

    return orders


# =====================================================
# CREATE STRIPE PAYMENT
# =====================================================

@router.post("/{order_id}/payment")
def create_payment(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    amount_in_paise = int(order.total_amount * 100)

    try:

        payment_intent = stripe.PaymentIntent.create(
            amount=amount_in_paise,
            currency="inr",
            metadata={
                "order_id": str(order.id),
                "user_id": str(current_user.id)
            }
        )

        return {
            "message": "PaymentIntent created successfully",
            "order_id": order.id,
            "amount": amount_in_paise,
            "currency": "inr",
            "client_secret": payment_intent.client_secret
        }

    except stripe.StripeError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =====================================================
# PAYMENT STATUS
# =====================================================

@router.get("/{order_id}/payment-status")
def get_payment_status(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "order_id": order.id,
        "status": order.status,
        "total_amount": order.total_amount
    }


# =====================================================
# STRIPE WEBHOOK
# =====================================================

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    payload = await request.body()

    sig_header = request.headers.get(
        "stripe-signature"
    )

    if not sig_header:
        raise HTTPException(
            status_code=400,
            detail="Missing Stripe signature"
        )

    webhook_secret = os.getenv(
        "STRIPE_WEBHOOK_SECRET"
    )

    if not webhook_secret:
        raise HTTPException(
            status_code=500,
            detail="Stripe webhook secret is not configured"
        )

    # -------------------------------------------------
    # VERIFY STRIPE WEBHOOK
    # -------------------------------------------------

    try:

        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            webhook_secret
        )

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Invalid payload"
        )

    except stripe.SignatureVerificationError:

        raise HTTPException(
            status_code=400,
            detail="Invalid Stripe signature"
        )


    # -------------------------------------------------
    # HANDLE SUCCESSFUL PAYMENT
    # -------------------------------------------------

    if event["type"] == "payment_intent.succeeded":

        payment_intent = event["data"]["object"]

        metadata = payment_intent["metadata"]

        order_id = None

        if "order_id" in metadata:
            order_id = metadata["order_id"]


        # ---------------------------------------------
        # FIND ORDER
        # ---------------------------------------------

        if order_id:

            order = db.query(Order).filter(
                Order.id == int(order_id)
            ).first()


            # -----------------------------------------
            # UPDATE ORDER + CLEAR CART
            # -----------------------------------------

            if order:

                # Mark order as Paid
                order.status = "Paid"


                # Clear user's cart after successful
                # Stripe payment
                db.query(Cart).filter(
                    Cart.user_id == order.user_id
                ).delete(
                    synchronize_session=False
                )


                # Save changes
                db.commit()


    # -------------------------------------------------
    # WEBHOOK RESPONSE
    # -------------------------------------------------

    return {
        "message": "Webhook received successfully"
    }