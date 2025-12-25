/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { LandlordOnly } from "@/components/shared/RoleGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { pacifico } from "@/lib/fonts";
import { useLogoutMutation } from "@/redux/features/auth/authApiSlice";
// import { useGetContentQuery } from "@/redux/features/content/contentApi";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";
import { type Notification } from "@/lib/api/notifications-api";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/redux/features/auth/authSlice";
import { AppDispatch } from "@/redux/store";
import * as LucideIcons from "lucide-react";
import {
  Bell,
  BookOpen,
  Building,
  Calculator,
  CheckCheck,
  ChevronDown,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Phone,
  PlusCircle,
  Settings,
  TrendingUp,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { TbHomeSearch } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// --- Time & Holiday Components ---

function DateTimeDisplay() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null; // Avoid hydration mismatch

  return (
    <div className="flex items-center gap-2 text-white/90">
      <LucideIcons.Clock className="w-4 h-4 text-cyan-200" />
      <span className="font-medium tracking-wide text-xs sm:text-sm">
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        <span className="mx-2 opacity-50">|</span>
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

// Fallback dates in case API fails
const FALLBACK_HOLIDAYS = [
  { date: "2025-12-25", name: "Christmas Day" },
  { date: "2026-02-21", name: "Intl. Mother Language Day" },
  { date: "2026-03-17", name: "Mujib's Birthday" },
  { date: "2026-03-26", name: "Independence Day" },
  { date: "2026-04-14", name: "Bengali New Year" },
  { date: "2026-05-01", name: "Labor Day" },
  { date: "2026-12-16", name: "Victory Day" },
];

function NextHolidayDisplay() {
  const [nextHoliday, setNextHoliday] = useState<{ date: string; name: string; daysLeft: number } | null>(null);

  useEffect(() => {
    async function fetchHoliday() {
      try {
        // Free Public Holiday API
        const res = await fetch('https://date.nager.at/api/v3/NextPublicHolidays/BD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const next = data[0];
            // data[0] is the immediate next holiday. e.g. { date: "2025-02-21", localName: "Language Day", ... }
            processHoliday({ date: next.date, name: next.name || next.localName });
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch holidays, using fallback.", error);
      }

      // Fallback logic
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = FALLBACK_HOLIDAYS
        .map(h => ({ ...h, obj: new Date(h.date) }))
        .filter(h => h.obj >= today)
        .sort((a, b) => a.obj.getTime() - b.obj.getTime())[0];

      if (upcoming) {
        processHoliday({ date: upcoming.date, name: upcoming.name });
      }
    }

    function processHoliday(holiday: { date: string; name: string }) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const holidayDate = new Date(holiday.date);
      const diffTime = Math.abs(holidayDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNextHoliday({ ...holiday, daysLeft: diffDays });
    }

    fetchHoliday();
  }, []);

  if (!nextHoliday) return null;

  return (
    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10 hover:bg-white/20 transition-colors">
      <span className="text-cyan-200">Next Holiday:</span>
      <span>{nextHoliday.name}</span>
      <span className="text-white/40">•</span>
      <span className={nextHoliday.daysLeft <= 3 ? "text-orange-300 font-bold" : "text-emerald-300"}>
        {nextHoliday.daysLeft === 0 ? "Today!" : `${nextHoliday.daysLeft} Day${nextHoliday.daysLeft !== 1 ? 's' : ''} Left`}
      </span>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [desktopActiveDropdown, setDesktopActiveDropdown] = useState<string | null>(null);

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Notification State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsSocket({
    autoFetch: isAuthenticated, // Only fetch if authenticated
  });

  const unreadCount = stats?.unread || 0;

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'booking': return <Home className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'booking': return 'bg-purple-100 text-purple-600';
      case 'maintenance': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function isActive(href?: string): boolean {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const initials = useMemo(() => {
    const n = user?.name?.trim();
    if (!n) return "U";
    const parts = n.split(" ").filter(Boolean);
    return (
      (parts[0]?.[0] ?? "U").toUpperCase() +
      (parts[1]?.[0]?.toUpperCase() ?? "")
    );
  }, [user?.name]);

  const handleSignOut = async () => {
    try {
      await logoutUser().unwrap();
      toast.success("Logged out successfully.");
      router.push("/login");
      setIsMobileMenuOpen(false);
    } catch (err) {
      toast.error("Failed to log out. Please try again.");
      console.error("Failed to log out:", err);
    }
  };

  // ... (inside component)
  // const { data: contentData } = useGetContentQuery("main-header");
  // const navContent = contentData?.data?.items;

  // Icon mapping helper
  const getIcon = (iconName: string) => {
    // @ts-expect-error - Lucide icons are dynamic
    return LucideIcons[iconName] || LucideIcons.HelpCircle;
  };

  const mainNavItems = [
    {
      href: "/properties",
      label: "Properties", // Renamed from Browse
      icon: Home,
      showAlways: true,
      hasDropdown: true,
      dropdownType: "properties"
    },
    {
      href: "/market-trends",
      label: "Market Trends",
      icon: TrendingUp,
      showAlways: true,
      hasDropdown: false
    },
    {
      href: "/blogs", // Assuming /blogs based on prev conversations, verified existence in generic sense
      label: "Blogs",
      icon: BookOpen,
      showAlways: true,
      hasDropdown: false
    },
    {
      href: "/about-us", // Standard route convention
      label: "About Us",
      icon: Building,
      showAlways: true,
      hasDropdown: false
    },
    {
      href: "/contact",
      label: "Contact",
      icon: Phone,
      showAlways: true,
      hasDropdown: false
    },
  ];


  // Property type dropdown items (no icons) - Combined for Sale and Rent
  const propertyTypes = [
    { href: "/properties", label: "For Sale", query: "sale", listingType: "sale" },
    { href: "/properties", label: "For Rent", query: "rent", listingType: "rent" },
    { href: "/properties", label: "Apartments", query: "apartment" },
    { href: "/properties", label: "Houses", query: "house" },
    { href: "/properties", label: "Lands", query: "land" },
    { href: "/properties", label: "Commercial", query: "commercial" },
    { href: "/properties", label: "New Projects", query: "new-projects" },
  ];

  // Resources dropdown items (no icons)
  const resourceItems = [
    { href: "/blog", label: "Blog & Guides" },
    { href: "/calculator", label: "EMI Calculator" },
    { href: "/market-trends", label: "Market Trends" },
    { href: "/legal", label: "Legal Support" },
  ];


  return (
    <>
      {/* Simple Top Bar with Branding Gradient - Clear UX */}
      <div className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left Side: Time & Holiday */}
            <div className="flex items-center gap-6">
              <DateTimeDisplay />
              <NextHolidayDisplay />
            </div>

            {/* Right Side: Links (Clearly Clickable with Visual Distinction) */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link
                href="/calculator"
                className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-white/10 hover:underline transition-all duration-200 cursor-pointer border-b border-transparent hover:border-white/50"
              >
                <Calculator className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">EMI Calculator</span>
                <span className="font-medium sm:hidden">EMI</span>
              </Link>
              <Link
                href="/market-trends"
                className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-white/10 hover:underline transition-all duration-200 cursor-pointer border-b border-transparent hover:border-white/50"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Market Trends</span>
                <span className="font-medium sm:hidden">Trends</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Compact */}
      <header
        className={`sticky top-0 z-50 w-full bg-white border-b transition-shadow duration-200 ${isScrolled ? "shadow-md" : "shadow-sm"
          }`}
      >
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-[85px]">
            {/* Logo - Compact */}
            <Link
              href="/"
              className={`${pacifico.className} text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg hover:drop-shadow-xl inline-flex items-center space-x-3 hover:scale-105 transition-transform duration-300`}
            >
              <div className="relative">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-cyan-100/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-cyan-100/50">
                  <span className="text-2xl text-cyan-600 lg:text-3xl"><TbHomeSearch /></span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="">HomeConnect</span>
            </Link>

            {/* Desktop Navigation with Icons and Dropdowns - Compact */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {mainNavItems.map((item: any) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setDesktopActiveDropdown(item.label)}
                    onMouseLeave={() => setDesktopActiveDropdown(null)}
                  >
                    {item.hasDropdown ? (
                      <>
                        <div
                          className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${isActive(item.href)
                            ? "text-cyan-700 bg-cyan-50"
                            : "text-gray-700 hover:text-cyan-700 hover:bg-cyan-50"
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="whitespace-nowrap">{item.label}</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </div>

                        {/* Mega Menu Dropdown */}
                        <div
                          className={`absolute left-0 top-full pt-4 transition-all duration-200 z-50 ${desktopActiveDropdown === item.label
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                            }`}
                        >
                          {item.dropdownType === "properties" ? (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-[800px] overflow-hidden flex">
                              {/* Left Content - 2 Columns */}
                              <div className="flex-1 p-8 grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  <Link href="/properties?lt=rent" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">Rent Property</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Find your perfect rental home from our verified listings.
                                    </p>
                                  </Link>
                                  <Link href="/properties?pt=house" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">Houses</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Standalone homes with space for your family.
                                    </p>
                                  </Link>
                                  <Link href="/properties?pt=commercial" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">Commercial</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Offices and retail spaces for your business.
                                    </p>
                                  </Link>
                                </div>

                                <div className="space-y-6">
                                  <Link href="/properties?lt=sale" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">Buy Property</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Invest in your future with our premium properties.
                                    </p>
                                  </Link>
                                  <Link href="/properties?pt=apartment" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">Apartments</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Modern flats in prime locations.
                                    </p>
                                  </Link>
                                  <Link href="/properties?pt=land" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">Land</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Plots ready for your dream construction.
                                    </p>
                                  </Link>
                                </div>
                              </div>

                              {/* Right Panel - Gradient Card */}
                              <div className="w-[300px] bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                                    <Home className="w-6 h-6 text-white" />
                                  </div>
                                  <h3 className="text-xl font-bold mb-2 font-heading">Join HomeConnect</h3>
                                  <p className="text-sm text-cyan-100 leading-relaxed">
                                    List your property today and reach thousands of potential buyers and tenants instantly.
                                  </p>
                                </div>

                                <Link
                                  href="/dashboard/add-property"
                                  className="relative z-10 inline-flex items-center text-sm font-semibold hover:text-cyan-200 transition-colors mt-6"
                                  onClick={() => setDesktopActiveDropdown(null)}
                                >
                                  List Property <LucideIcons.ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              </div>
                            </div>
                          ) : (
                            // Generic Dropdown for other items (if any)
                            <div className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[220px] py-2">
                              {/* Placeholder logic for others */}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(item.href)
                          ? "text-cyan-700 bg-cyan-50"
                          : "text-gray-700 hover:text-cyan-700 hover:bg-cyan-50"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Desktop Actions - Compact */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <LandlordOnly user={user}>
                    <Link href="/dashboard/add-property">
                      <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium shadow-lg shadow-cyan-500/20">
                        <PlusCircle className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden lg:inline">List Property</span>
                        <span className="lg:hidden">List</span>
                      </Button>
                    </Link>
                  </LandlordOnly>



                  <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="relative p-1.5 md:p-2 hover:bg-gray-100 rounded-lg outline-none">
                        <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 text-white text-[10px] md:text-xs rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 md:w-96 p-0">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                            onClick={(e) => {
                              e.preventDefault();
                              markAllAsRead();
                            }}
                          >
                            <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-[400px]">
                        {notifications && notifications.length > 0 ? (
                          <div className="divide-y">
                            {notifications.slice(0, 10).map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full shrink-0 ${getNotificationColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                      {notification.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1.5">
                                      {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        )}
                      </ScrollArea>
                      <div className="p-2 border-t bg-gray-50 text-center">
                        <Link
                          href="/dashboard/notifications"
                          className="text-xs text-blue-600 hover:underline font-medium block w-full py-1"
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          View All Notifications
                        </Link>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Detailed Notification Modal */}
                  <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="sm:max-w-md">
                      {selectedNotification && (
                        <>
                          <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="capitalize">
                                {selectedNotification.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(selectedNotification.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <DialogTitle>{selectedNotification.title}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className={`p-3 rounded-lg ${getNotificationColor(selectedNotification.type)} bg-opacity-10 border border-opacity-20`}>
                              <p className="text-sm leading-relaxed">
                                {selectedNotification.message}
                              </p>
                            </div>

                            {/* Contextual Properties display based on data */}
                            {selectedNotification.data && (
                              <div className="text-sm space-y-2">
                                {(selectedNotification.data as any).propertyName && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Property:</span>
                                    <span className="font-medium">{(selectedNotification.data as any).propertyName}</span>
                                  </div>
                                )}
                                {(selectedNotification.data as any).amount && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">${(selectedNotification.data as any).amount}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => deleteNotification(selectedNotification.id).then(() => setIsDetailOpen(false))}>
                              Delete
                            </Button>
                            {(selectedNotification.data as any)?.entityId && (
                              <Button asChild>
                                <Link href={
                                  selectedNotification.type === 'booking' ? `/dashboard/bookings/${(selectedNotification.data as any).entityId}` :
                                    selectedNotification.type === 'payment' ? `/dashboard/payments/${(selectedNotification.data as any).entityId}` :
                                      selectedNotification.type === 'property' ? `/properties/${(selectedNotification.data as any).entityId}` :
                                        '/dashboard/notifications'
                                } onClick={() => setIsDetailOpen(false)}>
                                  View Details
                                </Link>
                              </Button>
                            )}
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none group">
                      <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-white ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all shadow-sm">
                        <AvatarImage
                          src={user?.avatar}
                          alt={user?.name ?? "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-medium">
                          {/* Gender-based fallback if no avatar */}
                          {!user?.avatar && user?.gender ? (
                            <img
                              src={user.gender === 'female' ? '/avatars/female.png' : '/avatars/male.png'}
                              alt={user.gender}
                              className="h-full w-full object-cover"
                              // Fallback to initials if image fails to load (handled by browser usually, or we can use state)
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerText = initials;
                              }}
                            />
                          ) : (
                            initials
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-80 p-2 max-h-[85vh] overflow-y-auto">
                      <div className="px-2 py-3 bg-gray-50/50 rounded-t-lg -mx-2 -mt-2 mb-2 border-b">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200">
                            {initials}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-gray-900 truncate">{user?.name}</span>
                            <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold h-5 px-1.5 bg-blue-100/50 text-blue-700 border-blue-200">
                                {user?.role}
                              </Badge>
                              {user?.isPhoneVerified && (
                                <span className="text-[10px] text-emerald-600 flex items-center bg-emerald-50 px-1.5 rounded-full border border-emerald-100">
                                  <LucideIcons.ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-1">
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/dashboard" className="flex items-center w-full font-medium">
                            <LayoutDashboard className="mr-2 h-4 w-4 text-blue-500" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/dashboard/profile" className="flex items-center w-full font-medium">
                            <LucideIcons.User className="mr-2 h-4 w-4 text-purple-500" />
                            My Profile
                          </Link>
                        </DropdownMenuItem>

                        {/* ================= TENANT MENU ================= */}
                        {user?.role === 'tenant' && (
                          <>
                            <DropdownMenuSeparator className="my-2" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center">
                              <Home className="w-3 h-3 mr-1.5" /> Rental Management
                            </div>

                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-emerald-50">
                              <Link href="/dashboard/tenant-applications" className="flex items-center w-full text-gray-700">
                                <LucideIcons.FileText className="mr-3 h-4 w-4 text-emerald-500" />
                                My Applications
                                {/* Example Badge for pending items */}
                                <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] px-1.5 rounded-full font-bold">2</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-blue-50">
                              <Link href="/dashboard/my-rentals" className="flex items-center w-full text-gray-700">
                                <LucideIcons.Key className="mr-3 h-4 w-4 text-blue-500" />
                                Active Leases
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-amber-50">
                              <Link href="/dashboard/property-tours" className="flex items-center w-full text-gray-700">
                                <LucideIcons.CalendarClock className="mr-3 h-4 w-4 text-amber-500" />
                                Scheduled Tours
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 bg-gray-100" />

                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-rose-50">
                              <Link href="/dashboard/favorites" className="flex items-center w-full text-gray-700">
                                <Heart className="mr-3 h-4 w-4 text-rose-500" />
                                Saved Properties
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-2" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center">
                              <CreditCard className="w-3 h-3 mr-1.5" /> Finance & Support
                            </div>

                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-purple-50">
                              <Link href="/dashboard/payments" className="flex items-center w-full text-gray-700">
                                <LucideIcons.Receipt className="mr-3 h-4 w-4 text-purple-500" />
                                Payments & Invoices
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-orange-50">
                              <Link href="/dashboard/maintenance" className="flex items-center w-full text-gray-700">
                                <Wrench className="mr-3 h-4 w-4 text-orange-500" />
                                Maintenance Requests
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-cyan-50">
                              <Link href="/dashboard/lease-agreements" className="flex items-center w-full text-gray-700">
                                <LucideIcons.FolderOpen className="mr-3 h-4 w-4 text-cyan-500" />
                                My Documents
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}

                        {/* ================= LANDLORD MENU ================= */}
                        {user?.role === 'landlord' && (
                          <>
                            <DropdownMenuSeparator className="my-2" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center">
                              <Building className="w-3 h-3 mr-1.5" /> Property Hub
                            </div>

                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-indigo-50">
                              <Link href="/dashboard/properties" className="flex items-center w-full text-gray-700">
                                <LucideIcons.Building2 className="mr-3 h-4 w-4 text-indigo-500" />
                                My Properties
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-blue-50">
                              <Link href="/dashboard/add-property" className="flex items-center w-full text-gray-700">
                                <PlusCircle className="mr-3 h-4 w-4 text-blue-600" />
                                List New Property
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-emerald-50">
                              <Link href="/dashboard/tenant-applications" className="flex items-center w-full text-gray-700">
                                <LucideIcons.ClipboardList className="mr-3 h-4 w-4 text-emerald-500" />
                                Applications
                                <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] px-1.5 rounded-full font-bold">NEW</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-2" />
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center">
                              <LucideIcons.Briefcase className="w-3 h-3 mr-1.5" /> Management
                            </div>

                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-cyan-50">
                              <Link href="/dashboard/tenants" className="flex items-center w-full text-gray-700">
                                <LucideIcons.Users className="mr-3 h-4 w-4 text-cyan-600" />
                                Tenants & Leases
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-orange-50">
                              <Link href="/dashboard/maintenance" className="flex items-center w-full text-gray-700">
                                <LucideIcons.Hammer className="mr-3 h-4 w-4 text-orange-500" />
                                Maintenance Tasks
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-violet-50">
                              <Link href="/dashboard/reports" className="flex items-center w-full text-gray-700">
                                <LucideIcons.PieChart className="mr-3 h-4 w-4 text-violet-500" />
                                Financial Reports
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem asChild className="cursor-pointer group">
                          <Link href="/dashboard/messages" className="flex items-center w-full text-gray-600 group-hover:text-blue-600">
                            <MessageSquare className="mr-3 h-4 w-4 group-hover:text-blue-600 transition-colors" />
                            Messages
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer group">
                          <Link href="/dashboard/settings" className="flex items-center w-full text-gray-600 group-hover:text-gray-900">
                            <Settings className="mr-3 h-4 w-4 group-hover:text-gray-900 transition-colors" />
                            Settings & Privacy
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer group">
                          <Link href="/help" className="flex items-center w-full text-gray-600 group-hover:text-amber-600">
                            <LucideIcons.HelpCircle className="mr-3 h-4 w-4 group-hover:text-amber-600 transition-colors" />
                            Help & Support
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          disabled={isLoggingOut}
                          className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50 py-2.5 font-medium"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          {isLoggingOut ? "Logging out..." : "Sign Out"}
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                      <span className="hidden lg:inline">Get Started</span>
                      <span className="lg:hidden">Sign Up</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileMenuOpen) setOpenDropdown(null);
              }}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-5 w-5 text-gray-700" />
              ) : (
                <FiMenu className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t animate-slideDown">
            <div className="container mx-auto px-3 py-4">
              {/* Mobile Navigation with Icons and Dropdowns */}
              <div className="space-y-1 mb-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {mainNavItems.map((item: any) => {
                  const Icon = item.icon;
                  const isDropdownOpen = openDropdown === item.label;

                  return (
                    <div key={item.label}>
                      {item.hasDropdown ? (
                        <>
                          <button
                            onClick={() => setOpenDropdown(isDropdownOpen ? null : item.label)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg ${isActive(item.href)
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Mobile Dropdown Content */}
                          {isDropdownOpen && (
                            <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-1 mt-1">
                              {item.dropdownType === "properties"
                                ? propertyTypes.map((type) => (
                                  <Link
                                    key={type.query + (type.listingType || '')}
                                    href={type.listingType
                                      ? `${type.href}?lt=${type.listingType}`
                                      : `${type.href}?pt=${type.query}`}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      setOpenDropdown(null);
                                    }}
                                    className="block p-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-150"
                                  >
                                    {type.label}
                                  </Link>
                                ))
                                : null}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${isActive(item.href)
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-sm text-gray-500">
                        {user?.role === "landlord"
                          ? "Property Owner"
                          : "Member"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="text-sm">Dashboard</span>
                    </Link>
                    {/* Example: Mobile List Property - শুধু Landlord এর জন্য */}
                    <LandlordOnly user={user}>
                      <Link
                        href="/dashboard/add-property"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span className="text-sm">List Property</span>
                      </Link>
                    </LandlordOnly>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg border"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header >

      {/* Add CSS for animation */}
      < style jsx > {`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style >
    </>
  );
}
