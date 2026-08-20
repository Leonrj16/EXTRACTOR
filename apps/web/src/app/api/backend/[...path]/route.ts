import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, cookieOptions } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  return (await res.json()) as { accessToken: string; refreshToken: string };
}

async function forward(request: Request, path: string, accessToken?: string) {
  const contentType = request.headers.get("content-type");
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  return fetch(`${API_URL}/${path}`, {
    method: request.method,
    headers: {
      ...(contentType ? { "content-type": contentType } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
  });
}

async function handler(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  let backendRes = await forward(request, targetPath, accessToken);
  let refreshedCookies: { accessToken: string; refreshToken: string } | null = null;

  if (backendRes.status === 401) {
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      refreshedCookies = await refreshAccessToken(refreshToken);
      if (refreshedCookies) {
        backendRes = await forward(request, targetPath, refreshedCookies.accessToken);
      }
    }
  }

  const text = await backendRes.text();
  const response = new NextResponse(text, {
    status: backendRes.status,
    headers: { "content-type": backendRes.headers.get("content-type") ?? "application/json" },
  });

  if (refreshedCookies) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, refreshedCookies.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 15,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshedCookies.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });
  } else if (backendRes.status === 401) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
  }

  return response;
}

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
};
