"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthUser } from "@/redux/features/auth/authSlice";
import { BadgeCheck, Mail, Phone, ShieldCheck, User } from "lucide-react";

interface ProfileOverviewProps {
  user: AuthUser;
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    return (
      (parts[0]?.[0] ?? "U").toUpperCase() +
      (parts[1]?.[0]?.toUpperCase() ?? "")
    );
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
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
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
              {user.isEmailVerified && (
                <ShieldCheck className="h-4 w-4 text-green-500" title="Verified" />
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
                {user.phone || "Not set"}
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
