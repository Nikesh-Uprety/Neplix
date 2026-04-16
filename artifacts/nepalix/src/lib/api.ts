const API_BASE = "/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
};

export const api = {
  auth: {
    register: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) =>
      request<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: data,
      }),

    login: (data: { email: string; password: string }) =>
      request<{ user: AuthUser }>("/auth/login", {
        method: "POST",
        body: data,
      }),

    logout: () =>
      request<{ success: boolean }>("/auth/logout", { method: "POST" }),

    me: () => request<{ user: AuthUser }>("/auth/me"),
  },

  demoBookings: {
    create: (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      businessType: string;
      timeSlot: string;
      message?: string;
    }) =>
      request<{ booking: unknown }>("/demo-bookings", {
        method: "POST",
        body: data,
      }),
  },
};
