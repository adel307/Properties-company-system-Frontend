const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type QueryValue = string | number | boolean;

type ApiOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, QueryValue | null | undefined>;
  body?: unknown;
  next?: { revalidate?: number };
};

export async function apiFetch<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T | null> {
  const { params, headers, body, ...customConfig } = options;

  let queryString = '';
  if (params && Object.keys(params).length > 0) {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    queryString = `?${new URLSearchParams(cleanParams).toString()}`;
  }

  const config: RequestInit & { next?: { revalidate?: number } } = {
    method: customConfig.method || (body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': body instanceof FormData ? undefined : 'application/json',
      ...headers,
    },
    next: { revalidate: 0 },
    ...customConfig,
    body: body as BodyInit | null | undefined,
  };

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}${queryString}`, config);
    console.log(`[API Fetch] ${endpoint}${queryString} - Status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    }
    if (response.status === 204) return null;
    return await response.json() as T;
  } catch (error) {
    console.error(`[API Fetch Error] ${endpoint}:`, error);
    throw error instanceof Error ? error : new Error('Request failed');
  }
}