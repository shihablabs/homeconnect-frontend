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
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}

export function ProfileEditForm({ user, isEditing, setIsEditing }: ProfileEditFormProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
