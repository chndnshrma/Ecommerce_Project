import Cookies from 'js-cookie';

const TOKEN_KEY = 'ecommerce_token';
const USER_ID_KEY = 'ecommerce_user_id';
const ROLE_KEY = 'ecommerce_role';

export function setAuth(token: string, userId: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 1 });
  Cookies.set(USER_ID_KEY, userId, { expires: 1 });
  Cookies.set(ROLE_KEY, role, { expires: 1 });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getUserId(): string | undefined {
  return Cookies.get(USER_ID_KEY);
}
export function getRole(): string | undefined {
  return Cookies.get(ROLE_KEY);
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_ID_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return getRole() === 'ADMIN';
}
interface RazorpayOptions {
  key: string | undefined;
  amount: string;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}