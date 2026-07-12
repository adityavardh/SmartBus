"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  Users,
  Truck,
  Settings,
  User,
  AlertTriangle,
  Search,
  Menu,
  X,
  MapPin,
  LogOut,
  Bell,
  Baby,
  Navigation,
  FileText,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, useAuthStore } from "@/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "@/types";
import { RouteGuard } from "@/components/auth/route-guard";

const ROLE_NAV: Record<UserRole, { href: string; label: string; icon: React.ElementType }[]> = {
  student: [
    { href: "/dashboard/student", label: "Home", icon: LayoutDashboard },
    { href: "/map/student", label: "Live Bus", icon: Map },
    { href: "/route/student", label: "My Route", icon: Navigation },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/emergency", label: "SOS", icon: AlertTriangle },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
  parent: [
    { href: "/dashboard/parent", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/parent", label: "My Child", icon: Baby },
    { href: "/map/student", label: "Track Bus", icon: Map },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/emergency", label: "Emergency", icon: AlertTriangle },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
  driver: [
    { href: "/dashboard/driver", label: "Dashboard", icon: LayoutDashboard },
    { href: "/route/driver", label: "Today's Route", icon: MapPin },
    { href: "/attendance/driver", label: "Students", icon: Users },
    { href: "/attendance/driver", label: "Attendance", icon: ClipboardList },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/emergency", label: "SOS", icon: AlertTriangle },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/fleet/admin", label: "Fleet", icon: Truck },
    { href: "/map/admin", label: "Live Map", icon: Map },
    { href: "/reports/admin", label: "Reports", icon: FileText },
    { href: "/notifications", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
};

const ROLE_THEME: Record<UserRole, { primary: string, accent: string, border: string }> = {
  student: { primary: "text-primary bg-primary/15", accent: "bg-primary", border: "border-primary/25 shadow-[0_0_0_1px_rgba(46,139,255,0.15)]" },
  parent: { primary: "text-[#8b5cf6] bg-[#8b5cf6]/15", accent: "bg-[#8b5cf6]", border: "border-[#8b5cf6]/25 shadow-[0_0_0_1px_rgba(139,92,246,0.15)]" },
  driver: { primary: "text-accent bg-accent/15", accent: "bg-accent", border: "border-accent/25 shadow-[0_0_0_1px_rgba(255,194,71,0.15)]" },
  admin: { primary: "text-danger bg-danger/15", accent: "bg-danger", border: "border-danger/25 shadow-[0_0_0_1px_rgba(239,68,68,0.15)]" },
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, setSearchOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  
  const navItems = ROLE_NAV[user.role] || ROLE_NAV.student;
  const theme = ROLE_THEME[user.role] || ROLE_THEME.student;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-80 border-r border-white/10 bg-card/85 backdrop-blur-2xl flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-[18px_0_80px_rgba(0,0,0,0.24)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href={`/dashboard/${user.role}`} className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-[18px] bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-white text-lg">
              Smart<span className={theme.primary.split(' ')[0]}>Bus</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 mb-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[20px] bg-white/6 border border-white/10 text-white/45 text-sm hover:bg-white/10 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            Search...
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-[20px] text-sm font-medium transition-all overflow-hidden",
                  active
                    ? `${theme.primary} ${theme.border}`
                    : "text-white/52 hover:text-white hover:bg-white/6"
                )}
              >
                {active && <motion.span layoutId="sidebar-active" className={`absolute inset-y-2 left-2 w-1 rounded-full ${theme.accent}`} />}
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="rounded-[20px] bg-white/5 border border-white/10 p-3 flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/40 capitalize">{user.role}</p>
            </div>
            <button onClick={logout} className="text-white/30 hover:text-danger transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export function TopBar() {
  const { setSidebarOpen } = useAppStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-4 border-b border-white/8 bg-background/70 backdrop-blur-2xl">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-white/60 hover:text-white"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:flex items-center gap-3 text-sm text-white/45">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span>Live GPS syncing</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-success font-medium">Live</span>
        </div>
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="min-h-screen relative">
        <Sidebar />
        <div className="lg:pl-80 relative z-10">
          <TopBar />
          <main>{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const items = (ROLE_NAV[user.role] || ROLE_NAV.student).slice(0, 5);
  const theme = ROLE_THEME[user.role] || ROLE_THEME.student;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/10 bg-card/90 backdrop-blur-2xl">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                active ? theme.primary.split(' ')[0] : "text-white/40"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
