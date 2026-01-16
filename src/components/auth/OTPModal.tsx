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
import { ConfirmationResult, UserCredential } from "firebase/auth";
import { ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  confirmationResult: ConfirmationResult | null;
  onVerify: (result: UserCredential) => Promise<void>;
  isVerifying: boolean;
}

export const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  confirmationResult,
  onVerify,
  isVerifying,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      toast.error("Session expired. Please try signing up again.");
      return;
    }

    try {
      const result = await confirmationResult.confirm(otpValue);
      await onVerify(result);
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isVerifying && !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-bold tracking-tight">Verify Your Number</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-bold text-gray-900 mt-1 inline-block">{phoneNumber}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 text-center text-xl font-bold focus:border-blue-600 focus:ring-0 bg-gray-50/50"
                maxLength={1}
                disabled={isVerifying}
                autoFocus={index === 0}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-[10px] text-gray-400">
            Didn't receive the code? Wait <span className="font-medium">59s</span> to resend
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleVerify}
            disabled={isVerifying || otp.join("").length !== 6}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg transition-all active:scale-[0.98]"
          >
            {isVerifying ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Confirm & Finish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
