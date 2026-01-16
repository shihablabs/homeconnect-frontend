"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authApi } from "@/lib/api/auth-api";
import { AuthUser, updateUserProfile } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GeneralInfo } from "./GeneralInfo";
import { RoleBasedFields } from "./RoleBasedFields";
import { SocialLinks } from "./SocialLinks";

// Unified Schema
const profileSchema = z.object({
  // General
  name: z.string().min(3, "Name must be at least 3 characters"),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional(),

  // Landlord Specific
  title: z.string().max(100).optional(),
  yearsOfExperience: z.coerce.number().min(0).optional(),
  specializedArea: z.string().max(100).optional(),

  // Tenant Specific
  permanentAddress: z.string().optional(),
  nidNumber: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phoneNumber: z.string().optional(), // Removed regex for now to avoid strict validation issues on partial fills
  }).optional(),

  // Social Links
  socialLinks: z.object({
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
    instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
    website: z.string().url("Invalid Website URL").optional().or(z.literal("")),
  }).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  user: AuthUser;
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      title: user.title || "",
      yearsOfExperience: user.yearsOfExperience || 0,
      specializedArea: user.specializedArea || "",
      permanentAddress: (user as any).permanentAddress || "",
      nidNumber: (user as any).nidNumber || "",
      emergencyContact: {
        name: (user as any).emergencyContact?.name || "",
        relationship: (user as any).emergencyContact?.relationship || "",
        phoneNumber: (user as any).emergencyContact?.phoneNumber || "",
      },
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || "",
        twitter: user.socialLinks?.twitter || "",
        instagram: user.socialLinks?.instagram || "",
        website: user.socialLinks?.website || "",
      },
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const updatedUser = await authApi.updateProfile(data as any);
      dispatch(updateUserProfile(updatedUser)); // Update Redux state
      toast.success("Profile updated successfully", { id: toastId });
      setIsEditing(false); // Exit edit mode on success
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      name: user.name || "",
      bio: user.bio || "",
      title: user.title || "",
      yearsOfExperience: user.yearsOfExperience || 0,
      specializedArea: user.specializedArea || "",
      permanentAddress: (user as any).permanentAddress || "",
      nidNumber: (user as any).nidNumber || "",
      emergencyContact: {
        name: (user as any).emergencyContact?.name || "",
        relationship: (user as any).emergencyContact?.relationship || "",
        phoneNumber: (user as any).emergencyContact?.phoneNumber || "",
      },
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || "",
        twitter: user.socialLinks?.twitter || "",
        instagram: user.socialLinks?.instagram || "",
        website: user.socialLinks?.website || "",
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative">
        <div className="flex justify-end mb-4">
          {!isEditing && (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="gap-2"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar || "https://github.com/shadcn.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <div className="text-white text-xs font-medium text-center">
                    Change<br />Photo
                  </div>
                </label>

                {/* Visible Button for better UX */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-20">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs shadow-md rounded-full px-3"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                  >
                    Upload
                  </Button>
                </div>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const toastId = toast.loading("Uploading avatar...");
                    try {
                      const result = await authApi.uploadAvatar(file);
                      dispatch(updateUserProfile({ ...user, avatar: result.avatarUrl }));
                      toast.success("Avatar updated!", { id: toastId });
                    } catch (error: any) {
                      console.error("Avatar upload failed:", error);
                      toast.error("Failed to upload avatar", { id: toastId });
                    }
                  }}
                />
              </>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-xl text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <GeneralInfo form={form} disabled={!isEditing} />

        <RoleBasedFields form={form} role={user.role} disabled={!isEditing} />

        <SocialLinks form={form} disabled={!isEditing} />

        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
