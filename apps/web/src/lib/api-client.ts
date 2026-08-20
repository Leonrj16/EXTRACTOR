"use client";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Client Component fetch helper. Calls same-origin /api/backend/*, which
 * proxies to the NestJS API and attaches the JWT from the httpOnly cookie —
 * the token itself never reaches browser JS. */
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/backend${path}`, {
    ...init,
    headers: init?.body instanceof FormData
      ? init.headers
      : { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new ApiError(401, "Sesión expirada");
  }

  if (!res.ok) {
    const message = await res.text();
    throw new ApiError(res.status, message || "Error de red");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
