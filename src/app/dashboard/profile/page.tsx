/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Shield, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"; // Zod import

// Amader notun Redux hooks ebong slice-er jinishpotro
import type { AuthUser } from "@/redux/features/auth/authSlice";
import {
  logout,
  selectCurrentUser,
  updateUserProfile,
} from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// Amader notun User API

// ShadCN UI Components
import { ProtectedRoute } from "@/components/protected-route";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authApi } from "@/lib/api/auth-api";

interface IUpdateProfileRequest {
  name?: string;
  avatar?: string;
}
// -----------------------------------------------------------------
// VALIDATION SCHEMAS (Ei file-ei define kora holo)
// -----------------------------------------------------------------

const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  avatar: z
    .string()
    .url("Invalid avatar URL (must be a full URL)")
    .optional()
    .or(z.literal("")),
});
type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// 2. Change Password Schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"], // Kon field-e error dekhabe
  });
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// -----------------------------------------------------------------
// SUB-COMPONENT 1: General Information
// -----------------------------------------------------------------
function GeneralSettings({ user }: { user: AuthUser }) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
      avatar: user.avatar || "",
    },
  });

  const avatarPreview = form.watch("avatar");
  const namePreview = form.watch("name");

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    return (
      (parts[0]?.[0] ?? "U").toUpperCase() +
      (parts[1]?.[0]?.toUpperCase() ?? "")
    );
  };

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating profile...");

    try {
      // Shudhu poribortito data pathano
      const changedData: IUpdateProfileRequest = {};
      if (data.name !== user.name) changedData.name = data.name;
      if (data.avatar !== user.avatar) changedData.avatar = data.avatar;

      if (Object.keys(changedData).length === 0) {
        toast.info("No changes detected", { id: toastId });
        setIsSubmitting(false);
        return;
      }

      const updatedUser = await authApi.updateProfile(changedData);
      dispatch(updateUserProfile(updatedUser));

      toast.success("Profile updated successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Profile update failed", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <CardDescription>Apnar bebogto tothyo update korun.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={avatarPreview} alt={namePreview} />
                <AvatarFallback className="text-2xl">
                  {getInitials(namePreview)}
                </AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://image-url.com/avatar.png"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      disabled
                      value={user.email}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </FormControl>
                  {/* <FormDescription>Email poriborton kora jabe na.</FormDescription> */}
                </FormItem>
              )}
            />
            <FormField
              name="number"
              render={() => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      disabled
                      value={user.phone}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </FormControl>
                  {/* <FormDescription>Phone Number poriborton kora jabe na.</FormDescription> */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Apnar purno naam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t pt-6 mt-10">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// -----------------------------------------------------------------
// SUB-COMPONENT 2: Security Settings
// -----------------------------------------------------------------
function SecuritySettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Changing password...");

    try {
      const response = await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success(response.message, { id: toastId });
      form.reset(); // Form reset
    } catch (error: any) {
      console.error("Change password error:", error);
      toast.error(
        error.response?.data?.message || "Failed to change password",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Apnar password poriborton korun.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change Password
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// -----------------------------------------------------------------
// SUB-COMPONENT 3: Danger Zone (Bonus)
// -----------------------------------------------------------------
function DangerZone() {
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting account...");
    try {
      await authApi.deleteAccount();
      toast.success("Account deleted successfully. Redirecting...", {
        id: toastId,
      });

      // Delay dispatch and redirect to allow toast to be seen
      setTimeout(() => {
        dispatch(logout()); // Redux theke logout
        router.push("/"); // Home page a redirect
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete account", {
        id: toastId,
      });
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Ei action-gulo irreversible (fera-no jabe na).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <p className="font-medium">Delete Your Account</p>
            <p className="text-sm text-gray-600">
              Apnar account ebong somosto data sthayi-vabe muche fela hobe.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apni ki nishchit?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ei action-ti porobortite r bodlano jabe na. Eti apnar account
                  ebong somosto related data (properties, favorites, messages)
                  sthayi-vabe muche felbe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------
// MAIN COMPONENT: Profile Page
// -----------------------------------------------------------------
export default function ProfilePage() {
  const user = useAppSelector(selectCurrentUser);

  // ProtectedRoute eta handle korbe, kintu extra safety valo
  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading User...</span>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="text-gray-600">
              Apnar account settings manage korun (Role:{" "}
              <span className="font-semibold capitalize text-primary">
                {user.role}
              </span>
              )
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="general" className="w-full">
            <TabsList className={`grid w-full mb-6 ${user.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="general">
                <UserIcon className="mr-2 h-4 w-4" /> General
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="mr-2 h-4 w-4" /> Security
              </TabsTrigger>
              {user.role === 'admin' && (
                <TabsTrigger
                  value="danger"
                  className="text-destructive data-[state=active]:border-b-destructive data-[state=active]:text-destructive"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" /> Danger Zone
                </TabsTrigger>
              )}
            </TabsList>

            {/* Tab 1: General Settings */}
            <TabsContent value="general">
              <GeneralSettings user={user} />
            </TabsContent>

            {/* Tab 2: Security Settings */}
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            {/* Tab 3: Danger Zone - Only for Admin */}
            {user.role === 'admin' && (
              <TabsContent value="danger">
                <DangerZone />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
