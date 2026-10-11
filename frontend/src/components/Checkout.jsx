import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import API from "../api";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);


// =====================================================
// STRIPE PAYMENT FORM
// =====================================================

function StripePaymentForm({ orderId, onMessage }) {
  const stripe = useStripe();
  const elements = useElements();

  const [paying, setPaying] = useState(false);

  async function handlePayment(event) {
    event.preventDefault();

    if (!stripe || !elements) {
      onMessage("Payment form is still loading. Please wait.");
      return;
    }

    setPaying(true);
    onMessage("");

    try {
      console.log("Starting Stripe payment...");
      console.log("Order ID:", orderId);

      const result = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: window.location.href,
        },

        redirect: "if_required",
      });

      console.log("Stripe result:", result);

      // -----------------------------------------------
      // STRIPE ERROR
      // -----------------------------------------------

      if (result.error) {
        console.error("STRIPE PAYMENT ERROR:", result.error);

        const errorType = result.error.type || "Stripe error";
        const errorCode = result.error.code
          ? ` (${result.error.code})`
          : "";

        const errorMessage =
          result.error.message || "Payment failed.";

        onMessage(
          `${errorType}${errorCode}: ${errorMessage}`
        );

        return;
      }

      // -----------------------------------------------
      // PAYMENT INTENT
      // -----------------------------------------------

      if (result.paymentIntent) {
        console.log(
          "PaymentIntent status:",
          result.paymentIntent.status
        );

        console.log(
          "PaymentIntent ID:",
          result.paymentIntent.id
        );

        if (result.paymentIntent.status === "succeeded") {
          onMessage(
            `Payment successful for Order #${orderId}. Updating order status...`
          );

          // Give Stripe webhook a moment to reach backend
          setTimeout(async () => {
            try {
              const token = localStorage.getItem("access_token");

              if (!token) {
                onMessage(
                  "Payment successful, but login session expired. Please login again."
                );
                return;
              }

              const response = await API.get(
                `/orders/${orderId}/payment-status`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              console.log(
                "Order payment status:",
                response.data
              );

              if (response.data.status === "Paid") {
                onMessage(
                  `Payment successful! Order #${orderId} is Paid.`
                );
              } else {
                onMessage(
                  `Payment successful! Order #${orderId} is being updated. Please refresh My Orders in a few seconds.`
                );
              }
            } catch (error) {
              console.error(
                "Payment status check error:",
                error
              );

              onMessage(
                `Payment successful for Order #${orderId}. Please check My Orders.`
              );
            }
          }, 2000);

        } else if (
          result.paymentIntent.status === "processing"
        ) {
          onMessage(
            `Payment is processing for Order #${orderId}. Please check My Orders shortly.`
          );

        } else if (
          result.paymentIntent.status === "requires_action"
        ) {
          onMessage(
            "Additional payment authentication is required."
          );

        } else {
          onMessage(
            `Payment status: ${result.paymentIntent.status}`
          );
        }

        return;
      }

      // -----------------------------------------------
      // NO ERROR BUT NO PAYMENT INTENT
      // -----------------------------------------------

      onMessage(
        `Payment submitted for Order #${orderId}. Check My Orders for the updated status.`
      );

    } catch (error) {
      console.error(
        "PAYMENT CONFIRMATION ERROR:",
        error
      );

      console.error(
        "Full error:",
        JSON.stringify(error, null, 2)
      );

      onMessage(
        error?.message ||
          "Unable to confirm payment. Please try again."
      );

    } finally {
      setPaying(false);
    }
  }

  return (
    <form
      onSubmit={handlePayment}
      className="mt-6"
    >
      <PaymentElement />

      <button
        type="submit"
        disabled={
          !stripe ||
          !elements ||
          paying
        }
        className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {paying
          ? "Processing Payment..."
          : "Pay Securely"}
      </button>
    </form>
  );
}


// =====================================================
// CHECKOUT
// =====================================================

function Checkout({ cart }) {
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [orderId, setOrderId] = useState(null);

  const [clientSecret, setClientSecret] =
    useState("");


  // ===================================================
  // START CHECKOUT
  // ===================================================

  async function startCheckout() {

    // -----------------------------------------------
    // CART CHECK
    // -----------------------------------------------

    if (!cart || cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }


    // -----------------------------------------------
    // LOGIN CHECK
    // -----------------------------------------------

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      setMessage(
        "Please sign in again."
      );
      return;
    }


    // -----------------------------------------------
    // STRIPE KEY CHECK
    // -----------------------------------------------

    const publishableKey =
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      setMessage(
        "Stripe publishable key is not configured."
      );

      console.error(
        "VITE_STRIPE_PUBLISHABLE_KEY is missing."
      );

      return;
    }


    if (!publishableKey.startsWith("pk_test_")) {
      setMessage(
        "Stripe test publishable key is required."
      );

      console.error(
        "Stripe key does not start with pk_test_."
      );

      return;
    }


    setLoading(true);
    setMessage("");


    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };


    try {

      // =============================================
      // CREATE ORDER
      // =============================================

      console.log(
        "Creating StyleHub order..."
      );

      const orderResponse =
        await API.post(
          "/orders/",
          {},
          config
        );

      console.log(
        "Order response:",
        orderResponse.data
      );


      const newOrderId =
        orderResponse.data.id;


      if (!newOrderId) {
        throw new Error(
          "Backend did not return an order ID."
        );
      }


      setOrderId(newOrderId);


      // =============================================
      // CREATE STRIPE PAYMENT INTENT
      // =============================================

      console.log(
        "Creating Stripe PaymentIntent..."
      );

      const paymentResponse =
        await API.post(
          `/orders/${newOrderId}/payment`,
          {},
          config
        );


      console.log(
        "Payment response:",
        paymentResponse.data
      );


      const secret =
        paymentResponse.data.client_secret;


      if (!secret) {
        throw new Error(
          "Stripe did not return a payment client secret."
        );
      }


      if (
        !secret.startsWith("pi_")
      ) {
        console.warn(
          "Unexpected Stripe client secret format."
        );
      }


      setClientSecret(secret);


      setMessage(
        `Order #${newOrderId} created. Complete your payment below.`
      );

    } catch (error) {

      console.error(
        "CHECKOUT ERROR:",
        error
      );

      console.error(
        "CHECKOUT ERROR RESPONSE:",
        error.response?.data
      );


      setMessage(
        error.response?.data?.detail ||
          error.message ||
          "Unable to start checkout."
      );

    } finally {

      setLoading(false);

    }
  }


  // ===================================================
  // UI
  // ===================================================

  return (
    <section
      className="
        mt-8
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          text-gray-900
        "
      >
        Checkout
      </h2>


      <p
        className="
          mt-2
          text-sm
          text-gray-500
        "
      >
        Review your cart and pay securely using Stripe
        test mode.
      </p>


      {/* ============================================
          CONTINUE TO PAYMENT
      ============================================ */}

      {!clientSecret && (

        <button
          type="button"
          onClick={startCheckout}
          disabled={
            loading ||
            !cart ||
            cart.length === 0
          }
          className="
            mt-5
            rounded-xl
            bg-gray-950
            px-5
            py-3
            font-semibold
            text-white
            hover:bg-indigo-600
            disabled:opacity-50
          "
        >
          {loading
            ? "Preparing Checkout..."
            : "Continue to Payment"}
        </button>

      )}


      {/* ============================================
          STRIPE PAYMENT ELEMENT
      ============================================ */}

      {clientSecret && (

        <div
          className="
            mt-6
            rounded-xl
            bg-gray-50
            p-4
          "
        >

          <h3
            className="
              font-semibold
              text-gray-900
            "
          >
            Order #{orderId} — Payment
          </h3>


          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecret,
            }}
          >

            <StripePaymentForm
              orderId={orderId}
              onMessage={setMessage}
            />

          </Elements>

        </div>

      )}


      {/* ============================================
          MESSAGE
      ============================================ */}

      {message && (

        <p
          role="status"
          className="
            mt-4
            text-sm
            text-indigo-700
          "
        >
          {message}
        </p>

      )}

    </section>
  );
}


export default Checkout;