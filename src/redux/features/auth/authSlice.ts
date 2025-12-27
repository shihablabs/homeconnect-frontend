import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  avatar?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  isPhoneVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false, isInitialized: false };
  }

  try {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    if (token && userJson) {
      const user: AuthUser = JSON.parse(userJson);
      return {
        user: user,
        token: token,
        isAuthenticated: true,
        isInitialized: true,
      };
    }
  } catch (error) {
    console.error("Failed to parse auth state from localStorage:", error);
  }

  return { user: null, token: null, isAuthenticated: false, isInitialized: true };
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false, // Start uninitialized for SSR
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    hydrateAuth: (state) => {
      const hydratedState = getInitialState();
      state.user = hydratedState.user;
      state.token = hydratedState.token;
      state.isAuthenticated = hydratedState.isAuthenticated;
      state.isInitialized = true; // Mark as initialized after hydration check
    },
    updateUserProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setCredentials, logout, hydrateAuth, updateUserProfile } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }) =>
  state.auth.isInitialized;
