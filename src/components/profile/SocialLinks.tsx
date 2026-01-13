"use client";

import { User } from "@/lib/api/users-api";
import { FaGlobe, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

interface SocialLinksProps {
  socialLinks: User['socialLinks'];
}

export function SocialLinks({ socialLinks }: SocialLinksProps) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100/50">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Social Profiles</h3>
      <div className="flex gap-3">
        {/* Website */}
        {socialLinks?.website ? (
          <a
            href={socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-cyan-600 hover:border-cyan-100 hover:shadow-sm transition-all"
            title="Website"
          >
            <FaGlobe className="w-5 h-5" />
          </a>
        ) : (
          <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100 text-gray-300 cursor-not-allowed grayscale" title="Website not available">
            <FaGlobe className="w-5 h-5" />
          </div>
        )}

        {/* LinkedIn */}
        {socialLinks?.linkedin ? (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-blue-700 hover:border-blue-100 hover:shadow-sm transition-all"
            title="LinkedIn"
          >
            <FaLinkedin className="w-5 h-5" />
          </a>
        ) : (
          <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100 text-gray-300 cursor-not-allowed grayscale" title="LinkedIn not available">
            <FaLinkedin className="w-5 h-5" />
          </div>
        )}

        {/* Twitter */}
        {socialLinks?.twitter ? (
          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-sky-500 hover:border-sky-100 hover:shadow-sm transition-all"
            title="Twitter"
          >
            <FaTwitter className="w-5 h-5" />
          </a>
        ) : (
          <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100 text-gray-300 cursor-not-allowed grayscale" title="Twitter not available">
            <FaTwitter className="w-5 h-5" />
          </div>
        )}

        {/* Instagram */}
        {socialLinks?.instagram ? (
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-pink-600 hover:border-pink-100 hover:shadow-sm transition-all"
            title="Instagram"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
        ) : (
          <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100 text-gray-300 cursor-not-allowed grayscale" title="Instagram not available">
            <FaInstagram className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
