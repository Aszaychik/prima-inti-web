const API_URL = import.meta.env.API_URL || 'http://localhost:8080/api/v1';

// ---------- Public: no token, no refresh ----------
export async function fetchData(endpoint: string): Promise<any> {
  const response = await fetch(`${API_URL}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  return response.json();
}

// ---------- Admin: token + auto refresh ----------
import { getAccessToken, refreshAccessToken, logout } from './auth';

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const makeRequest = async (): Promise<T> => {
    const response = await fetch(`${API_URL}/${endpoint}`, { ...options, headers });
    
    // Handle 401 Unauthorized – attempt to refresh token
    if (response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken().then(success => {
          isRefreshing = false;
          if (success) {
            token = getAccessToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
            return makeRequest(); // retry the original request
          } else {
            logout();
            window.location.href = '/auth/login';
            throw new Error('Session expired');
          }
        });
      }
      return refreshPromise!;
    }

    // Handle 204 No Content (successful DELETE, no body)
    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed: ${response.statusText}`);
    }
    return data;
  };

  return makeRequest();
}

export async function get(endpoint: string) {
  return request(endpoint, { method: 'GET' });
}
export async function post(endpoint: string, body: any) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(body) });
}
export async function put(endpoint: string, body: any) {
  return request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
}
export async function del(endpoint: string) {
  return request(endpoint, { method: 'DELETE' });
}