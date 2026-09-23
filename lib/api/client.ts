const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export type QueryValue = string | number | boolean;

type ApiOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, QueryValue | null | undefined>;
  body?: unknown;
  next?: { revalidate?: number };
};

export async function apiFetch<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T | null> {
  const { params, headers, body, ...customConfig } = options;

  let queryString = '';
  if (params && Object.keys(params).length > 0) {
    const cleanParams = Object.entries(params).reduce((acc: Record<string, any>, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    queryString = `?${new URLSearchParams(cleanParams).toString()}`;
  }

  const defaultHeaders: Record<string, string> = {};
  if (!(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  if (API_KEY) {
    defaultHeaders['x-api-key'] = API_KEY;
  }

  const rawHeaders = { ...defaultHeaders, ...headers };
  const cleanHeaders: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (value !== undefined && value !== null) {
      cleanHeaders[key] = String(value);
    }
  }

  const config: RequestInit & { next?: { revalidate?: number } } = {
    method: customConfig.method || (body ? 'POST' : 'GET'),
    headers: cleanHeaders,
    next: { revalidate: 0 },
    ...customConfig,
    body: (body instanceof FormData ? body : typeof body === 'object' && body !== null ? JSON.stringify(body) : body) as BodyInit | null | undefined,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}${queryString}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    }
    if (response.status === 204) return null;
    return await response.json() as T;
  } catch (error) {
    console.log(`[API Fetch Error] ${endpoint}:`, error);
    // throw error instanceof Error ? error : new Error('Request failed');
  }
}