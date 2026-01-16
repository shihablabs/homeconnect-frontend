"use client";

import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { auth } from "@/lib/firebase.config";
import { useRefreshTokenMutation } from "@/redux/features/auth/authApiSlice";
import { logout, selectIsInitialized, setLoading, setToken, setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector, useAppStore } from "@/redux/hooks";
import { authService } from "@/services/authService";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const isInitialized = useAppSelector(selectIsInitialized);
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    // Flag to prevent double initialization
    let mounted = true;

    const initializeAuth = async () => {
      // 1. Attempt to restore session via HTTP-Only Cookie (Refresh Token)
      try {
        // This mutation will:
        // - Hit /auth/refresh-token
        // - On success: dispatch setCredentials (updates user, token, isAuthenticated)
        // - On error: throws
        await refreshToken({}).unwrap();
        // If successful, we are authenticated. 
        // Admin or Tenant, doesn't matter, Cookie is valid.
      } catch (error) {
        // Cookie missing or expired.
        // If user was Admin, they are now strictly logged out.
        // If user was Tenant, we check Firebase below.
      }

      // 2. Setup Firebase Listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (!mounted) return;

        const currentState = store.getState().auth;

        if (firebaseUser) {
          // If we are NOT authenticated yet (Cookie failed), OR we want to ensure sync
          if (!currentState.isAuthenticated) {
            try {
              const idToken = await firebaseUser.getIdToken();
              // Sync with Backend
              const authResponse = await authService.syncUser({
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                phoneNumber: firebaseUser.phoneNumber || "",
                avatar: firebaseUser.photoURL || "",
                firebaseUid: firebaseUser.uid,
                role: "tenant", // Default only if new
              }, idToken);

              // Update Redux
              dispatch(setUser(authResponse.user));
              dispatch(setToken(authResponse.token));
            } catch (err) {
              console.error("Firebase Sync Failed:", err);
              // Force logout if sync fails?
              dispatch(logout());
            }
          }
        } else {
          // Firebase User is null (Logged Out)
          // CRITICAL: specific check for Admin roles relative to Firebase.
          // Admins do NOT use Firebase. So Firebase being null is expected for them.
          // We only logout if the current user is a Tenant/Landlord (who SHOULD be in Firebase)
          // Or if we have no user at all.

          if (currentState.user) {
            const role = currentState.user.role;
            if (role === 'admin' || role === 'super-admin' || role === 'support') {
              // Do nothing. Admin session relies on Cookies, handled by refreshToken check above.
              // If Cookie expired, refreshToken() failed, so we might be authenticated=false anyway.
            } else {
              // Tenant/Landlord with no Firebase session -> Logout
              dispatch(logout());
            }
          } else {
            // No user in Redux -> ensure logout state final
            // dispatch(logout()); // Clean up just in case
          }
        }

        // Mark initialization complete
        // We do this inside the listener to ensure at least one check ran
        if (mounted) {
          // We dispatch a specific action to set initialized if needed, 
          // but setCredentials / logout sets it too.
          // Just force it false -> true explicitly if still loading
          dispatch(setLoading(false));
        }
      });

      return () => unsubscribe();
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch, refreshToken, store]);

  // Show Loader until we have checked Session at least once
  if (!isInitialized) {
    return <GlobalLoader message="Restoring secure session..." />;
  }

  return <>{children}</>;
};
