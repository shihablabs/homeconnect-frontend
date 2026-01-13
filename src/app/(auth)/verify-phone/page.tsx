"use client";

import { AuthLoginBrand } from "@/components/auth/AuthLayoutBrand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth-api";
import { auth } from "@/shared/utils/firebaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "sonner";
import { z } from "zod";
// Ensure firebaseClient init auth

const phoneSchema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type PhoneValues = z.infer<typeof phoneSchema>;
type OtpValues = z.infer<typeof otpSchema>;

export default function VerifyPhonePage() {
  const router = useRouter();
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    // Initialize Recaptcha
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);

  const onSendCode = async (data: PhoneValues) => {
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, data.phone, appVerifier);
      setConfirmationResult(result);
      setStep("OTP");
      toast.success("Verification code sent!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send code. Try again.";
      console.error(error);
      toast.error(errorMessage);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyCode = async (data: OtpValues) => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(data.otp);
      // Firebase verification success. Now mark in backend.
      await authApi.verifyPhone();

      toast.success("Phone verified successfully!");
      router.push("/dashboard");

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid code";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-6xl">
        <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">
          <AuthLoginBrand />

          <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-md space-y-6">
              <CardHeader className="p-0 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Verify Phone Number
                </CardTitle>
                <CardDescription>
                  {step === "PHONE"
                    ? "We need to verify your phone number to secure your account."
                    : "Enter the code sent to your phone."}
                </CardDescription>
              </CardHeader>

              {step === "PHONE" ? (
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onSendCode)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <PhoneInput
                              international
                              defaultCountry="BD"
                              placeholder="Enter phone number" // placeholder added
                              value={field.value}
                              onChange={field.onChange}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Code
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onVerifyCode)} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input placeholder="123456" {...field} maxLength={6} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      className="w-full"
                      onClick={() => setStep("PHONE")}
                      disabled={isLoading}
                    >
                      Back to Phone
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Global declaration for recaptcha
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}
