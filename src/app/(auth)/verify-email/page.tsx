"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/lib/api/auth-api";
import { AuthLoginBrand } from "@/components/auth/AuthLayoutBrand";
import { pacifico } from "@/lib/fonts";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Mail, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const sent = searchParams.get("sent");
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    setStatus("verifying");
    try {
      await authApi.verifyEmail(token);
      setStatus("success");
      setMessage("Email verified successfully! You can now log in.");
      toast.success("Email verified!");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Verification failed"
      );
      toast.error("Verification failed");
    }
  };

  if (sent) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">
            <AuthLoginBrand />

            <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
              <div className="w-full max-w-md text-center space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-blue-100 p-4">
                    <Mail className="h-12 w-12 text-blue-600" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600">
                    We have sent a verification link to your email address.
                    Please check your inbox and click the verification link to
                    activate your account.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Didn't receive the email?
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>Wait a few minutes and check again</li>
                  </ul>
                </div>

                <Button asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
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
            <div className="w-full max-w-md text-center space-y-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex lg:hidden items-center justify-center pb-6">
                  <Link
                    href="/"
                    className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                  >
                    HomeConnect
                  </Link>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Email Verification
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 space-y-6">
                {status === "verifying" && (
                  <>
                    <div className="flex justify-center">
                      <div className="rounded-full bg-blue-100 p-4">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Verifying your email...
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Please wait while we verify your email address.
                      </p>
                    </div>
                  </>
                )}

                {status === "success" && (
                  <>
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-100 p-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-green-600 mb-2">
                        {message}
                      </p>
                      <p className="text-sm text-gray-600">
                        You can now log in to your account.
                      </p>
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/login">Go to Login</Link>
                    </Button>
                  </>
                )}

                {status === "error" && (
                  <>
                    <div className="flex justify-center">
                      <div className="rounded-full bg-red-100 p-4">
                        <XCircle className="h-12 w-12 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-red-600 mb-2">
                        Verification Failed
                      </p>
                      <p className="text-sm text-gray-600 mb-4">{message}</p>
                      <p className="text-xs text-gray-500">
                        The verification link may have expired or is invalid.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button asChild>
                        <Link href="/register">Register Again</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/login">Go to Login</Link>
                      </Button>
                    </div>
                  </>
                )}

                {status === "idle" && !token && (
                  <>
                    <div className="flex justify-center">
                      <div className="rounded-full bg-gray-100 p-4">
                        <Mail className="h-12 w-12 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        No Verification Token
                      </p>
                      <p className="text-sm text-gray-600">
                        No verification token found in the URL. Please check
                        your email for the verification link.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button asChild>
                        <Link href="/register">Go to Registration</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/login">Go to Login</Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl">
            <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">
              <AuthLoginBrand />
              <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-blue-100 p-4">
                      <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <p className="text-gray-600">Preparing email verification...</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
