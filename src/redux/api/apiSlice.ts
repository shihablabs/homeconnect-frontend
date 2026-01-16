
import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import type { RootState } from "../store";

const sanitizeUrl = (url: string) => (url.endsWith("/") ? url : `${url}/`);

const resolveBaseUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) {
    return sanitizeUrl(explicit);
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocalHost =
      host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

    if (isLocalHost) {
      return "http://localhost:5000/api/";
    }
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000/api/";
  }

  return "https://hceub.vercel.app/api/";
};

const baseUrl = resolveBaseUrl();

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    let token = (getState() as RootState)?.auth?.token;

    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithGlobalErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    const data = result.error.data as any;

    if (status === 429) {
      toast.error("Too many requests. Please try again later.");
    } else if (status === 401 && (data?.message === "Invalid refresh token" || data?.message === "Refresh token expired")) {
      // Optionally handle automatic logout or redirect here if needed,
      // but usually the authSlice/AuthGuard handles the state clearing.
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithGlobalErrorHandling,
  tagTypes: [
    "Property",
    "User",
    "USER_PROPERTIES",
    "FEATURED_LIST",
    "FILTERS",
    "Booking",
    "Favorite",
    "Content",
    "Contact",
    "Blog",
    "Newsletter",
    "Inquiry",
  ],
  endpoints: (builder) => ({}),
});
