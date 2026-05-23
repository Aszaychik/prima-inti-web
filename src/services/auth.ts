const API_URL = import.meta.env.API_URL || 'http://localhost:8080/api/v1';

const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Login failed' };
    }

    const accessToken = data?.data?.access_token;
    const refreshToken = data?.data?.refresh_token;
    if (!accessToken || !refreshToken) {
      return { success: false, message: 'Missing tokens in response' };
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
}

export function logout() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await response.json();
    if (!response.ok) {
      logout();
      return false;
    }
    const newAccessToken = data?.data?.access_token;
    const newRefreshToken = data?.data?.refresh_token;
    if (newAccessToken && newRefreshToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      return true;
    }
    return false;
  } catch {
    logout();
    return false;
  }
}