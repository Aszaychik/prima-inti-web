const API_URL = import.meta.env.API_URL || 'http://localhost:8080/api/v1';

const TOKEN_KEY = 'admin_token';

export async function login(email, password) {
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

    const token = data?.data?.access_token;
    if (!token) {
      console.error('Token not found in response:', data);
      return { success: false, message: 'No token received from server' };
    }

    localStorage.setItem(TOKEN_KEY, token);
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}