"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { AlertTriangle, Shield, User as UserIcon } from "lucide-react";
import { DangerZone } from "./components/DangerZone";
import { ProfileEditForm } from "./components/ProfileEditForm";
import { ProfileOverview } from "./components/ProfileOverview";
import { SecuritySettings } from "./components/SecuritySettings";

export default function ProfilePage() {
  const user = useAppSelector(selectCurrentUser);

  if (!user) return null; // Should be handled by layout, but safeguard.

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Account Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information, security preferences, and account data.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar: Profile Overview (Sticky on Desktop) */}
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-8">
            <ProfileOverview user={user} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className={`grid w-full mb-6 ${user.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <TabsTrigger value="general">
                  <UserIcon className="mr-2 h-4 w-4" /> Personal Details
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

              <TabsContent value="general" className="space-y-6">
                <ProfileEditForm user={user} />
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <SecuritySettings />
              </TabsContent>

              <TabsContent value="danger">
                <DangerZone />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
