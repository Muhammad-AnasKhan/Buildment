import "server-only";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/shared/api/auth";
import { ApiError, apiHeaders, parseApiResponse, fetchApiResponse, type ApiRequestInit } from "@/lib/api-client";

// Server-side counterpart of apiFetch: Server Components and Server Actions call
// the API host directly and pass the visitor's session along as a Bearer token.

const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export type ServerApiRequestInit = ApiRequestInit & {
  /** Session token to send. Omit to forward the visitor's cookie; `null` sends none. */
  token?: string | null;
};

export async function serverApiFetch<T>(path: string, init: ServerApiRequestInit = {}): Promise<T> {
  const { json, token, ...rest } = init;
  const sessionToken = token === undefined ? (await cookies()).get(SESSION_COOKIE_NAME)?.value : token;

  const response = await fetchApiResponse(`${API_URL}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      ...apiHeaders(init),
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
  return parseApiResponse<T>(response);
}

/** Same as serverApiFetch, but a 404 from the API renders the Next.js not-found page. */
export async function serverApiFetchOrNotFound<T>(path: string, init: ServerApiRequestInit = {}): Promise<T> {
  try {
    return await serverApiFetch<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
