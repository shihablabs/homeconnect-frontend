"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Globe, Instagram, Linkedin, Share2, Twitter } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "./ProfileEditForm";

interface SocialLinksProps {
  form: UseFormReturn<ProfileFormData>;
  disabled?: boolean;
}

export function SocialLinks({ form, disabled }: SocialLinksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="h-5 w-5" />
          Social Profiles
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="socialLinks.website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Globe className="h-3 w-3" /> Website</FormLabel>
              <FormControl>
                <Input placeholder="https://your-website.com" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialLinks.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Linkedin className="h-3 w-3" /> LinkedIn</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/username" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialLinks.twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Twitter className="h-3 w-3" /> Twitter / X</FormLabel>
              <FormControl>
                <Input placeholder="https://twitter.com/username" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialLinks.instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Instagram className="h-3 w-3" /> Instagram</FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/username" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
