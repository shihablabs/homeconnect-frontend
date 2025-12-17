/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: [
    "Property",
    "User",
    "USER_PROPERTIES",
    "FEATURED_LIST",
    "FILTERS",
    "Booking",
    "Favorite",
    "Content",
  ],
  endpoints: (builder) => ({}),
});
