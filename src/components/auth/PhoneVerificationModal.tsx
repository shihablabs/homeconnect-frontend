"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth-api";
import { pacifico } from "@/lib/fonts";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { auth } from "@/shared/utils/firebaseClient";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "sonner";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const setupRecaptcha = useCallback((node: HTMLDivElement | null) => {
    if (node && !window.recaptchaVerifier && auth) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, node, {
          size: "invisible",
        });
      } catch (error) {
        console.error("Failed to initialize reCAPTCHA:", error);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleSendOtp = async () => {
    if (!auth) {
      toast.error("Firebase auth not initialized");
      return;
    }
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep("OTP");
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
        // The ref callback will handle re-initialization if the element remains
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (!confirmationResult) throw new Error("Verification failed. Please retry.");

      await confirmationResult.confirm(otp);

      // Update backend
      await authApi.verifyPhone();

      toast.success("Phone verified successfully! ✅");

      if (user && token) {
        dispatch(setCredentials({
          token,
          user: { ...user, isPhoneVerified: true }
        }));
      }

      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-[400px] border-none shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

        <div className="relative p-8 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <Link
              href="/"
              className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent inline-block mb-4`}
            >
              HomeConnect
            </Link>
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Verify Phone Number
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {step === "PHONE"
                ? "Secure your account by verifying your number"
                : "Enter the code we sent to your phone"}
            </DialogDescription>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {step === "PHONE" ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <PhoneInput
                    international
                    defaultCountry="BD"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-background transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent group-hover:border-blue-300"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  Verification Code
                </label>
                <Input
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  disabled={loading}
                  className="h-12 rounded-xl text-center text-xl tracking-[0.5em] font-bold border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div ref={setupRecaptcha}></div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            {step === "PHONE" ? (
              <Button
                onClick={handleSendOtp}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-200"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Code"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-200"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
                </Button>
                <button
                  onClick={() => setStep("PHONE")}
                  className="w-full text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors py-2"
                  disabled={loading}
                >
                  Change Phone Number
                </button>
              </>
            )}
          </div>

          <p className="text-[10px] text-center text-gray-400">
            By continuing, you agree to HomeConnect's terms of service and privacy policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal;
