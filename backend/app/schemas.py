from pydantic import BaseModel, EmailStr


# User schemas

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Product schemas

class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    category: str
    image_url: str | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: float
    category: str
    image_url: str | None

    class Config:
        from_attributes = True


# Cart schemas

class CartCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartResponse(BaseModel):
    id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

# Order schemas

class OrderCreate(BaseModel):
    pass


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str

    class Config:
        from_attributes = True