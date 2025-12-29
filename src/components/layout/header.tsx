
"use client";

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

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";
import { Conversation } from "@/lib/api/chat-api";
import { type Notification } from "@/lib/api/notifications-api";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/redux/features/auth/authSlice";
import { AppDispatch } from "@/redux/store";
import { formatDistanceToNow } from "date-fns";
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



function DateTimeDisplay() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null; 

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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allHolidays: { date: string; name: string; obj: Date }[] = [];

      
      const nextFriday = new Date(today);
      nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
      if (today.getDay() === 5) {
        
        allHolidays.push({ date: nextFriday.toISOString().split('T')[0], name: "Friday (Weekend)", obj: nextFriday });
      } else {
        allHolidays.push({ date: nextFriday.toISOString().split('T')[0], name: "Upcoming Friday", obj: nextFriday });
      }

      
      try {
        const res = await fetch('https://date.nager.at/api/v3/NextPublicHolidays/BD');
        if (res.ok) {
          const data: { date: string; localName: string; name: string }[] = await res.json();
          if (data && data.length > 0) {
            data.forEach(h => {
              allHolidays.push({ date: h.date, name: h.name || h.localName, obj: new Date(h.date) });
            });
          }
        }
      } catch (error) {
        console.warn("Failed to fetch public holidays, adding fallbacks.", error);
        FALLBACK_HOLIDAYS.forEach(h => {
          allHolidays.push({ ...h, obj: new Date(h.date) });
        });
      }

      
      const upcoming = allHolidays
        .filter(h => h.obj >= today) 
        .sort((a, b) => a.obj.getTime() - b.obj.getTime());

      
      if (upcoming.length > 0) {
        processHoliday(upcoming[0]);
      }
    }

    function processHoliday(holiday: { date: string; name: string }) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const holidayDate = new Date(holiday.date);
      
      holidayDate.setHours(0, 0, 0, 0);

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

  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    if (user) {
      
      
      
      
      
      
      
    }
  }, [user]);

  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsSocket({
    
    
    autoFetch: false, 
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

  
  
  

  
  const getIcon = (iconName: string) => {
    
    return LucideIcons[iconName] || LucideIcons.HelpCircle;
  };

  const mainNavItems = [
    {
      href: "/properties",
      label: "Properties", 
      icon: Home,
      showAlways: true,
      hasDropdown: true,
      dropdownType: "properties"
    },
    {
      href: "/blogs", 
      label: "Blogs",
      icon: BookOpen,
      showAlways: true,
      hasDropdown: false
    },
    {
      href: "/about-us", 
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


  
  const propertyTypes = [
    { href: "/properties", label: "For Sale", query: "sale", listingType: "sale" },
    { href: "/properties", label: "For Rent", query: "rent", listingType: "rent" },
    { href: "/properties", label: "Apartments", query: "apartment" },
    { href: "/properties", label: "Houses", query: "house" },
    { href: "/properties", label: "Lands", query: "land" },
    { href: "/properties", label: "Commercial", query: "commercial" },
    { href: "/properties", label: "New Projects", query: "new-projects" },
  ];

  
  const resourceItems = [
    { href: "/blog", label: "Blog & Guides" },
    { href: "/calculator", label: "EMI Calculator" },
    { href: "/market-trends", label: "Market Trends" },
    { href: "/legal", label: "Legal Support" },
  ];


  return (
    <>
      {}
      <div className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {}
            <div className="flex items-center gap-6">
              <DateTimeDisplay />
              <NextHolidayDisplay />
            </div>

            {}
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

      {}
      <header
        className={`sticky top-0 z-50 w-full bg-white border-b transition-shadow duration-200 ${isScrolled ? "shadow-md" : "shadow-sm"
          }`}
      >
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between h-14 md:h-[85px]">
            {}
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

            {}
            <nav className="hidden md:flex items-center space-x-1">
              {}
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

                        {}
                        <div
                          className={`absolute left-0 top-full pt-4 transition-all duration-200 z-50 ${desktopActiveDropdown === item.label
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                            }`}
                        >
                          {item.dropdownType === "properties" ? (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-[800px] overflow-hidden flex">
                              {}
                              <div className="flex-1 p-8 grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  {}
                                  <Link href="/properties" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">All Properties</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Browse our complete collection of verified listings.
                                    </p>
                                  </Link>

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
                                </div>

                                <div className="space-y-6">
                                  <Link href="/properties?pt=commercial" className="block group/item" onClick={() => setDesktopActiveDropdown(null)}>
                                    <h4 className="text-base font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">Commercial</h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      Offices and retail spaces for your business.
                                    </p>
                                  </Link>
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
                                </div>
                              </div>

                              {}
                              <div className="w-[300px] bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                                    <Home className="w-6 h-6 text-white" />
                                  </div>

                                  {}
                                  {!isAuthenticated ? (
                                    <>
                                      <h3 className="text-xl font-bold mb-2 font-heading">Join HomeConnect</h3>
                                      <p className="text-sm text-cyan-100 leading-relaxed">
                                        List your property today and reach thousands of potential buyers and tenants instantly.
                                      </p>
                                    </>
                                  ) : user?.role === 'landlord' || user?.role === 'admin' ? (
                                    <>
                                      <h3 className="text-xl font-bold mb-2 font-heading">Grow Your Portfolio</h3>
                                      <p className="text-sm text-cyan-100 leading-relaxed">
                                        Manage your properties and list new units to reach verified tenants quickly.
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <h3 className="text-xl font-bold mb-2 font-heading">Find Your Home</h3>
                                      <p className="text-sm text-cyan-100 leading-relaxed">
                                        Browse our exclusive listings to find the perfect place for you and your family.
                                      </p>
                                    </>
                                  )}
                                </div>

                                {}
                                {!isAuthenticated ? (
                                  <Link
                                    href="/dashboard/add-property"
                                    className="relative z-10 inline-flex items-center text-sm font-semibold hover:text-cyan-200 transition-colors mt-4"
                                    onClick={() => setDesktopActiveDropdown(null)}
                                  >
                                    List Property <LucideIcons.ArrowRight className="w-4 h-4 ml-2" />
                                  </Link>
                                ) : user?.role === 'landlord' || user?.role === 'admin' ? (
                                  <Link
                                    href="/dashboard/add-property"
                                    className="relative z-10 inline-flex items-center text-sm font-semibold hover:text-cyan-200 transition-colors mt-4"
                                    onClick={() => setDesktopActiveDropdown(null)}
                                  >
                                    List Property <LucideIcons.ArrowRight className="w-4 h-4 ml-2" />
                                  </Link>
                                ) : (
                                  <Link
                                    href="/properties"
                                    className="relative z-10 inline-flex items-center text-sm font-semibold hover:text-cyan-200 transition-colors mt-4"
                                    onClick={() => setDesktopActiveDropdown(null)}
                                  >
                                    Browse Properties <LucideIcons.ArrowRight className="w-4 h-4 ml-2" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          ) : (
                            
                            <div className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[220px] py-2">
                              {}
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

            {}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {}
                  {pathname?.startsWith('/dashboard') ? (
                    
                    <Link href="/properties">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
                        <Home className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden lg:inline">Browse Properties</span>
                        <span className="lg:hidden">Browse</span>
                      </Button>
                    </Link>
                  ) : (
                    
                    user?.role === 'landlord' ? (
                      <Link href="/dashboard/add-property">
                        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                          <PlusCircle className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="hidden lg:inline">List Property</span>
                          <span className="lg:hidden">List</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
                          <LayoutDashboard className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="hidden lg:inline">Dashboard</span>
                          <span className="lg:hidden">Dash</span>
                        </Button>
                      </Link>
                    )
                  )}



                  <DropdownMenu open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5" />
                        {unreadMsgCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                            {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0">
                      <div className="flex items-center justify-between p-3 border-b bg-gray-50/50">
                        <h4 className="font-semibold text-sm">Messages</h4>
                        {unreadMsgCount > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                            {unreadMsgCount} new
                          </span>
                        )}
                      </div>
                      <ScrollArea className="h-[320px]">
                        {recentConversations.length > 0 ? (
                          <div className="divide-y">
                            {recentConversations.slice(0, 5).map((conv) => (
                              <Link
                                key={conv.id || conv.partner.id}
                                href={`/dashboard/messages?partner=${conv.partner.id}`}
                                onClick={() => setIsMessageOpen(false)}
                                className={`block p-3 hover:bg-gray-50 transition-colors ${conv.unreadCount > 0 ? 'bg-blue-50/30' : ''}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative shrink-0">
                                    <Avatar className="h-9 w-9 border border-gray-100">
                                      <AvatarImage src={conv.partner.avatar} />
                                      <AvatarFallback>{conv.partner.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {conv.partner.isOnline && (
                                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                      <p className="text-sm font-medium text-gray-900 truncate pr-2">{conv.partner.name}</p>
                                      {conv.lastMessage && (
                                        <span className="text-[10px] text-gray-400 shrink-0">
                                          {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: true }).replace('about ', '')}
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                      {conv.lastMessage?.isFromMe && 'You: '}
                                      {conv.lastMessage?.content || 'No messages yet'}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <MessageSquare className="h-10 w-10 mb-2 opacity-10" />
                            <p className="text-sm">No messages yet</p>
                          </div>
                        )}
                      </ScrollArea>
                      <div className="p-2 border-t bg-gray-50 text-center">
                        <Link
                          href="/dashboard/messages"
                          className="text-xs text-blue-600 hover:underline font-medium block w-full py-1"
                          onClick={() => setIsMessageOpen(false)}
                        >
                          View All Messages
                        </Link>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

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

                  {}
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

                            {}
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
                    <DropdownMenuTrigger className="outline-none rounded-full ring-offset-2 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 focus:ring-2 focus:ring-primary/40">
                      <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-gray-200 shadow-sm">
                        <AvatarImage
                          src={user?.avatar}
                          alt={user?.name ?? "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/5 text-primary font-semibold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden shadow-xl border-gray-100/50 mt-2">
                      {}
                      <div className="flex flex-col items-center justify-center py-4 bg-white">
                        <div className="relative mb-2">
                          <Avatar className="h-12 w-12 border-[2px] border-white shadow-md ring-1 ring-gray-100">
                            <AvatarImage src={user?.avatar} className="object-cover" />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                            <div className="bg-emerald-500 h-2.5 w-2.5 rounded-full border-2 border-white"></div>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm text-gray-900 mb-0.5">{user?.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3 truncate max-w-[200px]">{user?.email}</p>

                        <Button
                          variant="outline"
                          className="rounded-full px-4 h-7 text-[10px] font-semibold border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={() => router.push('/dashboard/profile')}
                        >
                          Manage Account
                        </Button>
                      </div>

                      <div className="h-px bg-gray-100 w-full" />


                      <div className="grid gap-0.5 p-2">
                        <DropdownMenuItem asChild className="cursor-pointer h-8">
                          <Link href="/dashboard" className="flex items-center w-full font-medium text-xs">
                            <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-blue-500" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="cursor-pointer h-8">
                          <Link href="/dashboard/profile" className="flex items-center w-full font-medium text-xs">
                            <LucideIcons.User className="mr-2 h-3.5 w-3.5 text-purple-500" />
                            My Profile
                          </Link>
                        </DropdownMenuItem>

                        {}
                        {user?.role === 'tenant' && (
                          <>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-blue-50 h-8">
                              <Link href="/dashboard/my-rentals" className="flex items-center w-full text-gray-700 text-xs">
                                <LucideIcons.Key className="mr-2 h-3.5 w-3.5 text-blue-500" />
                                Active Leases
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-rose-50 h-8">
                              <Link href="/dashboard/favorites" className="flex items-center w-full text-gray-700 text-xs">
                                <Heart className="mr-2 h-3.5 w-3.5 text-rose-500" />
                                Saved Properties
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-emerald-50 h-8">
                              <Link href="/dashboard/my-tours" className="flex items-center w-full text-gray-700 text-xs">
                                <LucideIcons.CalendarClock className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                Scheduled Visits
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}

                        {}
                        {user?.role === 'landlord' && (
                          <>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-indigo-50 h-8">
                              <Link href="/dashboard/properties" className="flex items-center w-full text-gray-700 text-xs">
                                <LucideIcons.Building2 className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                                My Properties
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-blue-50 h-8">
                              <Link href="/dashboard/add-property" className="flex items-center w-full text-gray-700 text-xs">
                                <PlusCircle className="mr-2 h-3.5 w-3.5 text-blue-600" />
                                List New Property
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator className="my-1" />

                        <DropdownMenuItem asChild className="cursor-pointer group h-8">
                          <Link href="/dashboard/settings" className="flex items-center w-full text-gray-600 group-hover:text-gray-900 text-xs">
                            <Settings className="mr-2 h-3.5 w-3.5 group-hover:text-gray-900 transition-colors" />
                            Settings
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          disabled={isLoggingOut}
                          className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50 py-1.5 font-medium h-8 text-xs"
                        >
                          <LogOut className="mr-2 h-3.5 w-3.5" />
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

            {}
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

        {}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t animate-slideDown">
            <div className="container mx-auto px-3 py-4">
              {}
              <div className="space-y-1 mb-6">
                {}
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

                          {}
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

              {}
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
                    {}
                    {}
                    {user?.role === 'landlord' || user?.role === 'admin' ? (
                      <Link
                        href="/dashboard/add-property"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span className="text-sm">List Property</span>
                      </Link>
                    ) : (
                      <Link
                        href="/properties"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 bg-blue-50 text-blue-600 border-blue-100"
                      >
                        <Home className="h-4 w-4" />
                        <span className="text-sm">Browse Homes</span>
                      </Link>
                    )}
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

      {}
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
