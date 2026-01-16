import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/api";
import { AuthUser, updateUserProfile } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { BadgeCheck, Camera, Mail, Phone, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileOverviewProps {
  user: AuthUser;
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    return (
      (parts[0]?.[0] ?? "U").toUpperCase() +
      (parts[1]?.[0]?.toUpperCase() ?? "")
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (e.g. max 5MB, image only)
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload to backend (assuming backend has an upload endpoint, or use simple Base64 for now if not)
      // Since we don't have a dedicated upload endpoint in the provided context, 
      // we might fallback to updating the profile with a Base64 string if the backend supports it,
      // OR we can't implement this fully without backend support.
      // Let's assume there is a /upload endpoint or similar. 
      // Wait, looking at Context, no upload service found.
      // I will implement a workaround: Convert to Base64 and send to updateProfile.

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        // Send to auth service update profile
        await api.patch('/auth/profile', { avatar: base64Image });

        dispatch(updateUserProfile({ avatar: base64Image }));
        toast.success("Profile picture updated!");
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      }

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setUploading(false);
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
          <div className="relative mb-4 group cursor-pointer">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg group-hover:opacity-90 transition-opacity">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
              {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <Camera className="h-8 w-8" />}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />

            {user.isVerified && (
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
                <ShieldCheck className="h-4 w-4 text-green-500" title="Verified" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-yellow-500" title="Unverified" />
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
                <ShieldCheck className="h-4 w-4 text-green-500" title="Verified" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
