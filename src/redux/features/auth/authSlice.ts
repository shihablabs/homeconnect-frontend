import { auth } from "@/lib/firebase.config";
import { authService } from "@/services/authService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { signOut } from "firebase/auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  avatar?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  isActive?: boolean;
  bio?: string;
  title?: string;
  yearsOfExperience?: number;
  specializedArea?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  permanentAddress?: string;
  nidNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  status: 'idle' | 'loading' | 'authenticated';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true, // Start loading until Firebase confirms state
  status: 'loading',
  error: null,
};

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    // 1. Backend Logout (Clear HttpOnly Cookie)
    try {
      await authService.logout();
    } catch (error) {
      // Ignore network errors
    }

    // 2. Firebase Logout
    try {
      if (auth?.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      // Ignore firebase errors
    }

    // 3. Clear Client Storage
    if (typeof window !== "undefined") {
      // Clear all local storage
      localStorage.clear();

      // Clear all session storage
      sessionStorage.clear();

      // Clear all visible cookies (non-HttpOnly)
      try {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

          // Try clearing on various paths and domains
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
        }
      } catch (e) {
        console.error("Cookie clearing error:", e);
      }
    }

    // 4. Reset Redux API State (Clear RTK Query Cache)
    // We can dispatch this if we import apiSlice, but let's stick to auth reset here
    // The extraReducer will handle auth state reset.

    // 5. Hard Redirect to Login
    if (typeof window !== "undefined") {
      window.location.href = '/login';
    }

    return;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = action.payload ? 'authenticated' : 'idle';
      state.isLoading = false;
      state.isInitialized = true;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (typeof window !== "undefined" && action.payload) {
        localStorage.setItem("token", action.payload);
      }
    },
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.status = 'authenticated';
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.isLoading = false;
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        try {
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

            // Try clearing on various paths and domains
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
          }
        } catch (e) {
          console.error("Cookie clearing error:", e);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.status = action.payload ? 'loading' : state.isAuthenticated ? 'authenticated' : 'idle';
    },
    updateUserProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.isLoading = false;
      state.isInitialized = true;
    });
  }
});

export const {
  setUser,
  setToken,
  setCredentials,
  logout,
  updateUserProfile,
  setLoading,
  setError,
} = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
