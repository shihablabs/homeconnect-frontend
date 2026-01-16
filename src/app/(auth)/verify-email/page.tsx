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
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const otpParam = searchParams.get("otp");

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailParam || "",
      otp: otpParam || "",
    },
  });

  // Auto-fill form
  useEffect(() => {
    if (emailParam) form.setValue("email", emailParam);
    if (otpParam) form.setValue("otp", otpParam);
  }, [emailParam, otpParam, form]);

  // Auto-Verify Effect
  useEffect(() => {
    const autoVerify = async () => {
      if (emailParam && otpParam && !isSuccess && !isVerifying) {
        setIsVerifying(true);
        try {
          await authApi.verifyEmail({ email: emailParam, otp: otpParam });
          setIsSuccess(true);
          toast.success("Email verified successfully!");
        } catch (error: any) {
          toast.error(error?.message || "Auto-verification failed. Please try manually.");
        } finally {
          setIsVerifying(false);
        }
      }
    };

    // Need a small timeout or check to ensure we don't double fire strictly, 
    // but useEffect dependency on params is usually safe if handling boolean flags correctly.
    // However, fast re-renders might trigger it twice.
    if (emailParam && otpParam) {
      autoVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: VerifyEmailValues) {
    setIsLoading(true);
    try {
      await authApi.verifyEmail(data);
      setIsSuccess(true);
      toast.success("Email verified successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  // --- Success UI ---
  if (isSuccess) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 p-8 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-20 w-20 text-green-500 animate-in zoom-in duration-300" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">Verified!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your email has been successfully verified.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                size="lg"
                className="w-full text-lg font-semibold"
                onClick={() => router.push('/dashboard')}
              >
                Go to Property Tour
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg"
                onClick={() => router.push('/')}
              >
                Cancel / Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --- Auto Verifying Loader UI ---
  if (isVerifying) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
          <p className="text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">
          <AuthLoginBrand />

          <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-md space-y-6">
              <CardHeader className="p-0 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Verify Your Email
                </CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to your email.
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} readOnly={!!emailParam} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} maxLength={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Email
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Didn&apos;t receive code? Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={async () => {
                      const emailArg = form.getValues("email");
                      if (!emailArg) {
                        toast.error("Please enter email first");
                        return;
                      }
                      try {
                        await authApi.resendVerificationEmail(emailArg);
                        toast.success("Verification email resent!");
                      } catch (err: any) {
                        toast.error(err?.message || "Failed to resend");
                      }
                    }}
                    className="text-primary hover:underline font-semibold"
                  >
                    Resend Code
                  </button>
                </p>
              </div>

            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
