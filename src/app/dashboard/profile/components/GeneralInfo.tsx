"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "./ProfileEditForm";

interface GeneralInfoProps {
  form: UseFormReturn<ProfileFormData>;
  disabled?: boolean;
}

export function GeneralInfo({ form, disabled }: GeneralInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          General Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio / Description</FormLabel>
              <FormControl>
                {disabled ? (
                  <div className="min-h-[60px] p-3 rounded-md bg-gray-50 border border-gray-100 text-sm text-gray-600 whitespace-pre-wrap">
                    {field.value || "No bio added yet."}
                  </div>
                ) : (
                  <Textarea
                    placeholder="Tell us a bit about yourself..."
                    className="min-h-[100px] resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
