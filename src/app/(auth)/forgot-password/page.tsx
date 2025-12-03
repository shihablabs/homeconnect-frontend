"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLoginBrand } from "@/components/auth/AuthLayoutBrand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { pacifico } from "@/lib/fonts";
import { authApi } from "@/lib/api/auth-api";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Sending password reset link...");

    try {
      await authApi.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success("Password reset link sent! Check your email.", {
        id: toastId,
      });
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || "Failed to send reset link. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">
            <AuthLoginBrand />

            <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
              <div className="w-full max-w-md text-center space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-4">
                    <Mail className="h-12 w-12 text-green-600" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="font-semibold text-gray-900">
                      {form.getValues("email")}
                    </span>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-800">
                    <strong>Didn&apos;t receive the email?</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Wait a few minutes and try again</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      form.reset();
                    }}
                    variant="outline"
                  >
                    Send Another Email
                  </Button>
                  <Button asChild>
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">
          <AuthLoginBrand />

          <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-md">
              <CardHeader className="p-0 pb-8 text-center">
                <div className="flex lg:hidden items-center justify-center pb-6">
                  <Link
                    href="/"
                    className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                  >
                    HomeConnect
                  </Link>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                  Forgot Password?
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Enter your email address and we&apos;ll send you a link to reset
                  your password.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                              disabled={isSubmitting}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back to Login
                  </Link>
                </div>

                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 text-center">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

