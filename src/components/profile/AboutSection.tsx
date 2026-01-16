"use client";

import { User } from "@/lib/api/users-api";
import { Mail, Phone } from "lucide-react";
import { SocialLinks } from "./SocialLinks";

interface AboutSectionProps {
  profile: User;
}

export function AboutSection({ profile }: AboutSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-cyan-100 transition-colors">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
          </div>
          <p className="text-gray-900 font-medium pl-11 truncate" title={profile.email}>{profile.email}</p>
        </div>

        {profile.phone && (
          <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-cyan-100 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
            </div>
            <p className="text-gray-900 font-medium pl-11">{profile.phone}</p>
          </div>
        )}
      </div>

      {/* Professional Bio */}
      {profile.bio && (
        <div className="mt-8 pt-6 border-t border-gray-100/50">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Professional Bio</h3>
          <div
            className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: profile.bio }}
          />
        </div>
      )}

      {/* Social Links */}
      <SocialLinks socialLinks={profile.socialLinks} />
    </div>
  );
}
