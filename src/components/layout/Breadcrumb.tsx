"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on home page
  if (pathname === "/") {
    return null;
  }

  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Route label mappings for better readability
  const routeLabels: Record<string, string> = {
    "dashboard": "Dashboard",
    "properties": "Properties",
    "my-properties": "My Properties",
    "add-property": "Add Property",
    "favorites": "Favorites",
    "messages": "Messages",
    "settings": "Settings",
    "about": "About Us",
    "contact": "Contact",
    "calculator": "EMI Calculator",
    "market-trends": "Market Trends",
  };
  
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      
      // Check if it's a UUID or long ID (typically 36+ chars), show "Details"
      if (segment.length > 30 || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return { label: "Details", href };
      }
      
      // Use mapped label or format from segment
      const label = routeLabels[segment] || segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      
      return { label, href };
    }),
  ];

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-gray-600"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                  <Home className="h-4 w-4 text-blue-600" />
                </Link>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                  {isLast ? (
                    <span className="font-medium text-gray-600">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

