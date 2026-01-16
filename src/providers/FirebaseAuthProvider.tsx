"use client";

import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { auth } from "@/lib/firebase.config";
import { useRefreshTokenMutation } from "@/redux/features/auth/authApiSlice";
import { logout, selectIsInitialized, setCredentials, setLoading, setToken, setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector, useAppStore } from "@/redux/hooks";
import { authService } from "@/services/authService";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const isInitialized = useAppSelector(selectIsInitialized);
  const [refreshToken] = useRefreshTokenMutation();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    // Isolate Admin Routes: If we are on an admin route, DO NOT run Firebase logic.
    // Admin auth is handled purely by Redux state + LocalStorage (via AuthInitializer).
    const isAdminRoute = pathname?.startsWith('/dashboard/admin') || pathname?.startsWith('/admin-login');

    if (isAdminRoute) {
      if (mounted) dispatch(setLoading(false));
      return () => { };
    }

    if (!auth) {
      if (mounted) dispatch(setLoading(false));
      return () => { };
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!mounted) return;

      const currentState = store.getState().auth;
      console.log("🔥 [FirebaseAuthProvider] Auth State Change:", {
        hasFirebaseUser: !!firebaseUser,
        email: firebaseUser?.email,
        isAuthenticatedInRedux: currentState.isAuthenticated,
        pathname
      });

      if (firebaseUser) {
        if (!currentState.isAuthenticated) {
          console.log("🔥 [FirebaseAuthProvider] User found but not authenticated in Redux. Reviving session...");
          try {
            await refreshToken({}).unwrap();
          } catch (refreshError) {
            // If refresh fails (e.g. no cookie), fallback to full sync
            try {
              const idToken = await firebaseUser.getIdToken();
              const authResponse = await authService.syncUser({
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                phoneNumber: firebaseUser.phoneNumber || "",
                avatar: firebaseUser.photoURL || "",
                firebaseUid: firebaseUser.uid,
                role: "tenant", // Default only if new
              }, idToken);

              dispatch(setUser(authResponse.user));
              dispatch(setToken(authResponse.token));
              console.log("🔥 [FirebaseAuthProvider] Session revived via Firebase sync.");
            } catch (err) {
              console.error("Firebase Sync Failed:", err);
              dispatch(logout());
            }
          }
        }
      } else {
        // Firebase user is null. Check if we have an Admin/Support session in Redux OR LocalStorage.
        const currentReduxUser = store.getState().auth.user;
        let isAdminSession = false;

        // Check Redux State
        if (currentReduxUser && ['admin', 'super-admin', 'support'].includes(currentReduxUser.role)) {
          isAdminSession = true;
          console.log("🔥 [FirebaseAuthProvider] Admin/Support session found in Redux state.");
        }

        // Check LocalStorage (Fallback for race conditions)
        if (!isAdminSession && typeof window !== 'undefined') {
          try {
            const localUserStr = localStorage.getItem("user");
            if (localUserStr) {
              const localUser = JSON.parse(localUserStr);
              if (localUser && ['admin', 'super-admin', 'support'].includes(localUser.role)) {
                // We typically let AuthInitializer hydrate this, but to be safe, we just DON'T logout here yet.
                // Or we can proactively restore it if Redux is empty.
                if (!currentReduxUser) {
                  const token = localStorage.getItem("token");
                  if (token) {
                    dispatch(setCredentials({ user: localUser, token }));
                    isAdminSession = true;
                  }
                } else {
                  isAdminSession = true;
                }
              }
            }
          } catch (e) {
            console.error("Error reading storage in auth provider", e);
          }
        }

        if (!isAdminSession) {
          dispatch(logout());
        }
      }

      if (mounted) {
        dispatch(setLoading(false));
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [dispatch, refreshToken, store]);

  if (!isInitialized) {
    return <GlobalLoader message="Restoring secure session..." />;
  }

  return <>{children}</>;
};
