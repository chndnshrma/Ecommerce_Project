export interface Variant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  effectivePrice: number;
  imageUrl: string | null;
  stockAvailable: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  basePrice: number;
  categoryName: string;
  variants: Variant[];
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CartItem {
  cartItemId: string;
  variantId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stockAvailable: number;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  totalAmount: number;
}

export interface OrderItem {
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPriceAtPurchase: number;
  lineTotal: number;
}

export interface Order {
  orderId: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}
export interface PaymentOrderResponse {
  razorpayOrderId: string;
  amount: string;
  currency: string;
  internalOrderId: string;
}

// Minimal shape of what Razorpay's checkout.js passes to the success handler
export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}