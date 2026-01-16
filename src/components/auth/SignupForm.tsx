"use client";

import { OTPModal } from "@/components/auth/OTPModal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { authApi } from "@/lib/api/auth-api";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";
import { useAppDispatch } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmationResult, UserCredential } from "firebase/auth";
import {
  ArrowRight,
  Briefcase,
  Home,
  Key,
  Lock,
  Mail,
  Phone,
  PlusCircle,
  ShieldCheck,
  User
} from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number is too short").regex(/^\+?[\d\s-]+$/, "Invalid characters in phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  role: z.enum(["tenant", "landlord"], {
    error: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "+880",
      password: "",
      confirmPassword: "",
      role: "tenant",
    },
  });

  const handleVerify = async (result: UserCredential) => {
    setVerifying(true);
    const data = form.getValues();
    try {
      // Trigger Backend Registration using authApi for consistency and cookie handling
      // We pass the firebaseUid from the result
      await authApi.register({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: data.role,
      });

      // Trigger Backend OTP Email (optional, since phone is verified, but user liked it)
      await authApi.resendVerificationEmail(data.email);

      setModalOpen(false);

      Swal.fire({
        title: "Registration Complete!",
        text: "Your account has been successfully created and verified.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push(`/verify-email?email=${data.email}`);
    } catch (error: any) {
      console.error("Registration Error after Phone Verify:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to complete registration.");
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (data: SignupValues) => {
    if (!auth) {
      toast.error("Authentication service unavailable (Missing Configuration)");
      return;
    }
    console.log("[Firebase Debug] Attempting phone verification with:", {
      phoneNumber: data.phoneNumber,
      authConfigured: !!auth,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Found" : "Missing"
    });
    if (!data.phoneNumber) {
      console.error("[Firebase Debug] Phone number is missing or invalid.");
      toast.error("Phone number is required for verification.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Initialize reCAPTCHA
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      // Trigger Firebase Phone Verification
      const confirmation = await signInWithPhoneNumber(auth, data.phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setModalOpen(true);
      toast.success("Verification code sent to your phone!");
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast.error(error.message || "Failed to send verification code.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
        <p className="text-gray-500 font-medium">Join our community of verified property seekers & owners</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>First Name</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>Last Name</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Email Address</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>Phone Number</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="+88017XXXXXXXX" {...field} className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20" />
                </FormControl>
                <p className="text-[10px] text-gray-400">We'll send a 6-digit OTP to verify your phone</p>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Password</span>
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Confirm Password</span>
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span>I am joining as a</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="tenant" id="tenant" className="peer sr-only" />
                      </FormControl>
                      <Label
                        htmlFor="tenant"
                        onClick={() => field.onChange("tenant")}
                        className={`flex flex-col items-center justify-between rounded-2xl border-2 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 transition-all cursor-pointer group ${field.value === 'tenant' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-gray-100 shadow-sm'}`}
                      >
                        <div className="mb-3 rounded-full bg-blue-100 p-3 group-hover:scale-110 transition-transform">
                          <Key className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">Find Properties</p>
                          <p className="text-xs text-gray-500 mt-1">Rent or Buy (ভাড়া বা ক্রয়)</p>
                        </div>
                      </Label>
                    </FormItem>

                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="landlord" id="landlord" className="peer sr-only" />
                      </FormControl>
                      <Label
                        htmlFor="landlord"
                        onClick={() => field.onChange("landlord")}
                        className={`flex flex-col items-center justify-between rounded-2xl border-2 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 transition-all cursor-pointer group ${field.value === 'landlord' ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-gray-100 shadow-sm'}`}
                      >
                        <div className="mb-3 rounded-full bg-indigo-100 p-3 group-hover:scale-110 transition-transform">
                          <div className="relative">
                            <Home className="h-6 w-6 text-indigo-600" />
                            <PlusCircle className="absolute -top-1 -right-1 h-3 w-3 text-indigo-700 fill-white" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">Property Owner</p>
                          <p className="text-xs text-gray-500 mt-1">Landlord (বাড়িওয়ালা)</p>
                        </div>
                      </Label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />



          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl group rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </Form>

      <div id="recaptcha-container"></div>

      <OTPModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        phoneNumber={form.getValues("phoneNumber")}
        confirmationResult={confirmationResult}
        onVerify={handleVerify}
        isVerifying={verifying}
      />
    </div>
  );
}
