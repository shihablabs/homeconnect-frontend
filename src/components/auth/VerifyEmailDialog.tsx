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
import { authApi } from "@/lib/api/auth-api";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VerifyEmailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onSuccess?: () => void;
}

export function VerifyEmailDialog({
  isOpen,
  onOpenChange,
  email,
  onSuccess,
}: VerifyEmailDialogProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyEmail({ email, otp });
      toast.success("Email verified successfully!");
      onOpenChange(false);
      onSuccess?.();
      // Force reload to update user state if needed, or rely on Redux update if implemented
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-4">
          {/* Fallback to simple Input if InputOtp is not available/configured, 
                but assuming shadcn logic, let's use a simple Input first to be safe 
                and avoid 'InputOtp' missing errors if the user doesn't have it installed.
                The user environment didn't explicitly show input-otp.tsx in the list.
                I will use a standard Input for safety. 
            */}
          <div className="flex items-center justify-center py-4">
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\d*$/.test(value)) return;

                    const newOtp = otp.split("");
                    newOtp[index] = value;
                    const newOtpStr = newOtp.join("");
                    setOtp(newOtpStr);

                    if (value && index < 5) {
                      const nextInput = document.getElementById(`otp-${index + 1}`);
                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      const prevInput = document.getElementById(`otp-${index - 1}`);
                      prevInput?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
                    if (pastedData) {
                      setOtp(pastedData);
                      const nextIndex = Math.min(pastedData.length, 5);
                      document.getElementById(`otp-${nextIndex}`)?.focus();
                    }
                  }}
                  className="w-12 h-14 text-center text-2xl font-bold border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-background"
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={isLoading || otp.length < 6}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
