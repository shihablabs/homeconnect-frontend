import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/api";
import { authApi } from "@/lib/api/auth-api";
import { AuthUser, updateUserProfile } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";

import { BadgeCheck, Loader2, Mail, Phone, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileOverviewProps {
  user: AuthUser;
  isEditing: boolean;
}

export function ProfileOverview({ user, isEditing }: ProfileOverviewProps) {
  const dispatch = useAppDispatch();
  const [sendingVerification, setSendingVerification] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    return (
      (parts[0]?.[0] ?? "U").toUpperCase() +
      (parts[1]?.[0]?.toUpperCase() ?? "")
    );
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading avatar...");
    try {
      const result = await authApi.uploadAvatar(file);
      // Backend returns unified user object or { avatar: 'url' } 
      // Based on auth.controller.ts, it returns sendResponse(res, 200, "...", user);
      // So result is the updated user object.
      dispatch(updateUserProfile(result));
      toast.success("Avatar updated!", { id: toastId });
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      toast.error("Failed to upload avatar", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (sendingVerification) return;
    setSendingVerification(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.message || "Failed to send verification email");
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-3xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-black/50 z-10">
                <label
                  htmlFor="overview-avatar-upload"
                  className="flex flex-col items-center justify-center h-full w-full cursor-pointer p-2 text-center"
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <>
                      <div className="bg-white/20 p-2 rounded-full mb-1">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider leading-none">
                        Change<br />Avatar
                      </span>
                    </>
                  )}
                  <input
                    id="overview-avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}

            {user.verificationStatus === 'verified' && !isEditing && (
              <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                <BadgeCheck className="h-6 w-6 text-blue-500 fill-white" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <Badge variant="secondary" className="mt-2 capitalize">
            {user.role}
          </Badge>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium truncate max-w-[150px]" title={user.email}>
                {user.email}
              </span>
              {user.isEmailVerified ? (
                <span title="Verified">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </span>
              ) : (
                <span title="Unverified">
                  <ShieldAlert className="h-4 w-4 text-yellow-500" />
                </span>
              )}
            </div>
          </div>



          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Phone className="h-4 w-4" />
              <span>Phone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {user.phoneNumber || "Not set"}
              </span>
              {user.isPhoneVerified && (
                <span title="Verified">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card >
  );
}
