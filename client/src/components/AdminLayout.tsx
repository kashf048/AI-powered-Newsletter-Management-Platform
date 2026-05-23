import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Bell, Zap, LayoutDashboard, FileText, Users, Sparkles, DollarSign, Trophy, BarChart3, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Issues", href: "/admin/issues", icon: FileText },
  { label: "Subscribers", href: "/admin/subscribers", icon: Users },
  { label: "AI Studio", href: "/admin/ai-studio", icon: Sparkles, badge: "NEW" },
  { label: "Sponsors", href: "/admin/sponsors", icon: DollarSign },
  { label: "Referrals", href: "/admin/referrals", icon: Trophy },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  const logout = trpc.auth.logout.useMutation();

  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  } as any);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success("Successfully logged out");
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <span className="animate-pulse">Loading secure admin environment...</span>
      </div>
    );
  }

  // Redirect to home if user is not authorized
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-center px-4 font-sans text-white">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-2">
          <X className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          This portal requires authenticated admin role.
        </p>
        <Link href="/">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6">
            Return to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 border-r border-slate-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Brand Logo header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between h-16 shrink-0">
          <div className={`flex items-center gap-2 ${!sidebarOpen && "justify-center w-full"}`}>
            <Zap className="w-6 h-6 text-emerald-500 shrink-0" />
            {sidebarOpen && <span className="font-bold text-lg tracking-tight">NexusAI</span>}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Footer controls section */}
        <div className="border-t border-slate-800/80 p-3 space-y-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/60 ${!sidebarOpen && "justify-center"}`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="ml-2.5 text-xs font-semibold">Logout</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/60 ${!sidebarOpen && "justify-center"}`}
          >
            {sidebarOpen ? <X className="w-4 h-4 shrink-0" /> : <Menu className="w-4 h-4 shrink-0" />}
            {sidebarOpen && <span className="ml-2.5 text-xs font-semibold">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation title banner */}
        <header className="bg-slate-900 border-b border-slate-800/80 px-6 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Admin Portal</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-9 w-9">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main nested layout */}
        <main className="flex-1 overflow-auto bg-slate-950 relative">
          <div className="p-6 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
