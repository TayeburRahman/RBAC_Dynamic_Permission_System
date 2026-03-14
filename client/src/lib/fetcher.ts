import { cookies } from "next/headers";

export const serverFetch = async (
  endpoint: string,
  options: Omit<RequestInit, "body"> & {
    body?: unknown;
    tags?: string[];
    revalidate?: number;
    isPublic?: boolean;
  } = {}
) => {
  const { tags, revalidate, headers, isPublic, ...rest } = options;
  let body = options.body;

  const defaultHeaders: Record<string, string> = {};

  if (!isPublic) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (accessToken) {
      defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  // Automatically handle body stringification and Content-Type
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      // For FormData, browser sets boundary
    } else if (typeof body === "object") {
      body = JSON.stringify(body);
      defaultHeaders["Content-Type"] = "application/json";
    }
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_API}${endpoint}`;

  if (process.env.NODE_ENV === "development") {
    console.log(`🚀 [API Request]: ${rest.method || "GET"} ${endpoint}`);
  }

  const res = await fetch(url, {
    ...rest,
    body: body as BodyInit,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    next: {
      ...(tags && { tags }),
      ...(revalidate !== undefined && { revalidate }),
    },
  });

  // Handle Non-OK responses
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (process.env.NODE_ENV === "development") {
      console.error(`❌ [API Error]: ${endpoint}`, errorData);
    }
    throw new Error(errorData.message || `Fetch failed: ${res.statusText}`);
  }

  // Handle 204 No Content or empty bodies
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null;
  }

  return res.json();
};