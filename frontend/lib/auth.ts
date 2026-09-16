import Cookies from 'js-cookie';

const TOKEN_KEY = 'ecommerce_token';
const USER_ID_KEY = 'ecommerce_user_id';

export function setAuth(token: string, userId: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 1 });
  Cookies.set(USER_ID_KEY, userId, { expires: 1 });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getUserId(): string | undefined {
  return Cookies.get(USER_ID_KEY);
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_ID_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}