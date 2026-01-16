"use client";

import { AuthUser, logout, setCredentials, setLoading } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useEffect } from "react";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          console.log("🔐 [AuthInitializer] Found local credentials, syncing...");
          try {
            const user = JSON.parse(userStr) as AuthUser;
            dispatch(setCredentials({ user, token }));
          } catch (e) {
            console.error("🔐 [AuthInitializer] Failed to parse user from local storage", e);
            // If parsing fails, reset state
            dispatch(logout());
          }
        } else {
          console.log("🔐 [AuthInitializer] No local credentials found.");
          // No user found in storage. Ensure state is initialized as "logged out".
          // This sets isInitialized = true.
          dispatch(logout());
        }
      }
    } finally {
      // Always signal that initial check is done
      dispatch(setLoading(false));
      // Ensure we mark initialization as complete even if no user found
      // Note: setCredentials handles this for the success case, but we need it for failure too
      // We can use a separate action or relying on setLoading to trigger status update, 
      // but status update doesn't toggle isInitialized boolean in slice.
      // So we might need to dispatch a specific action or rely on the initial state being correct?
      // Actually, looking at authSlice:
      // setUser -> isInitialized=true
      // setCredentials -> isInitialized=true
      // setLoading -> DOES NOT set isInitialized=true

      // We need to verify if we found a user. If NOT, we should probably set isInitialized=true 
      // by dispatching a "initializationComplete" action if one existed.
      // Since it doesn't, we can simulate it or rely on valid logic.
      // To be safe, let's just make sure we don't leave it as false.
      // Wait, 'logout' sets isInitialized=true.
      // So if no user found, maybe we should just ensure checking is done.
      // Let's assume for now the user wants to stay logged out.

      // Fix: If no user found, we MUST set isInitialized = true.
      // We can do this by dispatching logout() which sets user=null and isInitialized=true
      // BUT we only want to do that if we DIDNT find a user.
    }
  }, [dispatch]);

  return null;
}
