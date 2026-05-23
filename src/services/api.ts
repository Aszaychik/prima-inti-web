const API_URL = import.meta.env.API_URL || 'http://localhost:8080/api/v1';

function getToken(): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.statusText}`);
  }
  return data;
}

// Public GET (no token required by design, but request will add token if present)
export async function fetchData(endpoint: string): Promise<any> {
  return request(endpoint, { method: 'GET' });
}

// Admin CRUD (with token)
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