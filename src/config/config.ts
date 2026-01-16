const LOCAL_API = "http://localhost:5000/api";
const VERCEL_API = "https://hceub.vercel.app/api";

const sanitize = (url: string) => url.replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) {
    return sanitize(explicit);
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

    if (isLocal) {
      return LOCAL_API;
    }
  }

  if (process.env.NODE_ENV === "development") {

    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      console.log("[Config] resolving API URL:", {
        explicit,
        nodeEnv: process.env.NODE_ENV,
        host,
        isLocal: host === "localhost" || host === "127.0.0.1" || host.endsWith(".local"),
        result: LOCAL_API
      });
    }
    return LOCAL_API;
  }

  return VERCEL_API;
};

export const API_BASE_URL = resolveApiBaseUrl();
console.log("[Config] Final API_BASE_URL:", API_BASE_URL);