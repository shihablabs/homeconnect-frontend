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
import { authApi } from "@/lib/api/auth-api"; // Using direct API calls for simplicity or hook if available
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailParam || "",
      otp: "",
    },
  });

  useEffect(() => {
    if (emailParam) {
      form.setValue("email", emailParam);
    }
  }, [emailParam, form]);

  async function onSubmit(data: VerifyEmailValues) {
    setIsLoading(true);
    try {
      await authApi.verifyEmail(data);
      toast.success("Email verified successfully! Please log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
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
                  Didn't receive code? Check your spam folder.
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
