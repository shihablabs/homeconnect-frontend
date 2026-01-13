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
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      toast.error("Session expired. Please try signing up again.");
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      await onVerify(result);
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isVerifying && !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">ফোন ভেরিফিকেশন</DialogTitle>
          <DialogDescription className="text-center">
            আমরা আপনার ফোনে একটি OTP পাঠিয়েছি, দয়া করে কনফার্ম করুন।
            <br />
            <span className="font-semibold text-primary">{phoneNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="otp"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest h-14"
              maxLength={6}
              disabled={isVerifying}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== 6}
            className="w-full sm:w-auto min-w-[150px]"
          >
            {isVerifying ? "যাচাই করা হচ্ছে..." : "যাচাই করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
