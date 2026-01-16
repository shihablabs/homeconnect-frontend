"use client";

import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase.config";
import { setStatus, setUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ConfirmationResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const setupRecaptcha = (containerId: string) => {
    if (!auth) return null;
    return new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });
  };

  const loginWithPhone = async (phoneNumber: string, containerId: string) => {
    try {
      dispatch(setStatus("loading"));
      const appVerifier = setupRecaptcha(containerId);
      if (!appVerifier || !auth) throw new Error("Firebase Auth not initialized");

      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      toast.success("OTP sent to your phone number");
      return result;
    } catch (error: any) {
      console.error("Phone login error:", error);
      toast.error(error.message || "Failed to send OTP");
      dispatch(setStatus("idle"));
      return null;
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      if (!confirmationResult) throw new Error("No confirmation result found");
      dispatch(setStatus("loading"));
      const result = await confirmationResult.confirm(otp);
      toast.success("Phone verified successfully");
      return result.user;
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Invalid OTP");
      dispatch(setStatus("idle"));
      return null;
    }
  };

  const logout = async () => {
    try {
      if (!auth) return;
      await auth.signOut();
      dispatch(setUser(null));
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Logout failed");
    }
  };

  return {
    user,
    status,
    isLoading: status === "loading",
    loginWithPhone,
    verifyOtp,
    logout,
    confirmationResult,
  };
};
