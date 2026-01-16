"use client";

import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlobalLoader } from "../ui/GlobalLoader";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if initialization is complete
    if (isInitialized) {
      if (!isAuthenticated) {
        // Not logged in -> Redirect to Login
        router.replace("/login?from=" + encodeURIComponent(window.location.pathname));
        return;
      }

      // Role check
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Wrong Role -> Redirect to 403 or Dashboard
        // If Admin trying to access Tenant route?
        if (['admin', 'super-admin'].includes(user.role)) {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard");
        }
      }
    }
  }, [isInitialized, isAuthenticated, user, router, allowedRoles]);

  if (!isInitialized) {
    return <GlobalLoader message="Verifying access..." />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null; // Will redirect
  }

  return <>{children}</>;
};
