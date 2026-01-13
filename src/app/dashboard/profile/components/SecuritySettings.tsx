"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { authApi } from "@/lib/api/auth-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Loader2, Lock, Mail, Shield, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
    path: ["confirmPassword"],
  });
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

function PasswordChangeDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

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
      form.reset();
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800">
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new strong password.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Password
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function SecuritySettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    marketing: false,
    security: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications updated`);
      return newState;
    });
  };

  return (
    <div className="space-y-6">
      {/* Account Security Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <CardTitle>Account Security</CardTitle>
          </div>
          <CardDescription>Manage your password and account recovery options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50">
            <div className="space-y-1">
              <p className="font-medium text-sm">Password</p>
              <p className="text-xs text-gray-500">Last changed recently</p>
            </div>
            <PasswordChangeDialog />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Choose what notifications you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates about your activity.</p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={() => handleToggle('email')}
            />
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100/50 rounded-lg text-purple-600">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Marketing & Promotions</p>
                <p className="text-xs text-gray-500">Receive offers and property highlights.</p>
              </div>
            </div>
            <Switch
              checked={notifications.marketing}
              onCheckedChange={() => handleToggle('marketing')}
            />
          </div>

          {/* Security Alerts */}
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100/50 rounded-lg text-red-600">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Security Alerts</p>
                <p className="text-xs text-gray-500">Get notified about suspicious logins.</p>
              </div>
            </div>
            <Switch
              checked={notifications.security}
              onCheckedChange={() => handleToggle('security')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
