"use client";

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
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { API_BASE_URL } from "@/config/config";
import { auth } from "@/lib/firebase";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  ConfirmationResult,
  EmailAuthProvider,
  linkWithCredential,
  RecaptchaVerifier,
  sendEmailVerification,
  signInWithPhoneNumber,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { OTPModal } from "./OTPModal";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize Recaptcha
  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth not initialized");
      return;
    }
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: "tenant",
    },
  });

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
      // Trigger early email verification in the background
      axios.post(`${API_BASE_URL}/auth/send-verification-early`, {
        email: data.email,
        password: data.password
      }).catch(err => console.error("Early email error:", err));

      const appVerifier = window.recaptchaVerifier;
      // Sanitize phone number (remove spaces/dashes)
      const formattedPhoneNumber = data.phoneNumber.replace(/[\s-]/g, '');
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setModalOpen(true);
      toast.info("OTP sent to your phone");
    } catch (error: any) {
      if (error.code === 'auth/billing-not-enabled') {
        try {
          const { createUserWithEmailAndPassword } = await import("firebase/auth");
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

          const fakeConfirmation: any = {
            confirm: async (code: string) => {
              if (code === '123456') return userCredential;
              throw new Error("Invalid code (Use 123456 for Dev Mode)");
            },
            verificationId: "dev-mode-verification-id"
          };

          setConfirmationResult(fakeConfirmation);
          setModalOpen(true);
          toast.warning("Billing Mock Enabled: Use code 123456", {
            description: "Phone verification bypassed for development."
          });
          return;

        } catch (createUserError: any) {
          console.error("Fallback creation failed:", createUserError);
          toast.error(createUserError.message);
          setLoading(false);
          return;
        }
      }

      console.error("Signup/OTP Error Detail:", {
        code: error.code,
        message: error.message,
        customData: error.customData,
        fullError: error
      });
      toast.error(error.message || "Failed to send OTP. Check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (result: UserCredential) => {
    setVerifying(true);
    try {
      const user = result.user;
      const { firstName, lastName, email, role, phoneNumber } = form.getValues();
      const password = form.getValues("password");

      // Fix: Link Email/Password credential instead of just updating email
      // This solves "OPERATION_NOT_ALLOWED" and also sets the password for the user.
      try {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(user, credential);
      } catch (linkError: any) {
        if (linkError.code === 'auth/provider-already-linked') {
          // Already linked, proceed (idempotent)
        } else if (linkError.code === 'auth/credential-already-in-use') {
          throw new Error("This email is already linked to another account.");
        } else {
          // Rethrow other errors to be caught by outer catch
          throw linkError;
        }
      }
      await updateProfile(user, { displayName: `${firstName} ${lastName}` });

      // Refresh token after profile updates to ensure claims are current
      const idToken = await user.getIdToken(true);

      // Sync with Backend
      const response = await axios.post(
        `${API_BASE_URL}/auth/sync-user`,
        {
          name: `${firstName} ${lastName}`.trim(),
          email,
          role,
          phoneNumber,
          firebaseUid: user.uid,
          password: form.getValues("password"),
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      // Fix: Manually update Redux state to avoid race condition with FirebaseAuthProvider
      // This ensures token is available immediately for /dashboard calls
      if (response.data?.data?.token && response.data?.data?.user) {
        dispatch(setCredentials({
          user: response.data.data.user,
          token: response.data.data.token
        }));
      }

      // Trigger Email Verification
      await sendEmailVerification(user);

      toast.success("Account created successfully!");
      setModalOpen(false);
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Verification Error:", error);
      toast.error(error.message || "Failed to verify/sync account.");
    } finally {
      setVerifying(false);
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
                  <p className="text-[10px] text-gray-400">Enter your official first name</p>
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
                  <p className="text-[10px] text-gray-400">Enter your legal last name</p>
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
                <p className="text-[10px] text-gray-400">We'll send a verification link to this email</p>
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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

          <div id="recaptcha-container" className="flex justify-center"></div>

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
