"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { RootState } from "@/redux/store";
import axios from "axios";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface PhoneVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          
        },
      });
    }
  }, [isOpen]);

  const handleSendOtp = async () => {
    if (!auth) {
      toast.error("Authentication service unavailable (Missing Configuration)");
      return;
    }
    if (!phoneNumber) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP. Please try again.");
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (!confirmationResult) throw new Error("No confirmation result found");

      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/verify-phone`,
        { idToken },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Phone verified successfully! ✅");

        
        if (user && token) {
          dispatch(setCredentials({
            token,
            user: { ...user, isPhoneVerified: true }
          }));
        }

        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Phone Verification</DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "Enter your phone number to receive a verification code."
              : "Enter the 6-digit code sent to your phone."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {step === "phone" ? (
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number (with country code)
              </label>
              <Input
                id="phone"
                placeholder="+88017XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="otp"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div id="recaptcha-container"></div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {step === "phone" ? (
            <Button onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </Button>
          ) : (
            <Button onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
