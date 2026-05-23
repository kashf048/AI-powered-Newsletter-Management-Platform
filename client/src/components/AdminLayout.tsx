import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Bell, Zap, LayoutDashboard, FileText, Users, Sparkles, DollarSign, Trophy, BarChart3, Settings, Sun, Moon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();

  const logout = useMutation({
    mutationFn: apiService.auth.logout
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: apiService.auth.getMe,
    refetchOnWindowFocus: false,
    retry: false,
  });

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
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-sans">
        <span className="animate-pulse">Loading secure admin environment...</span>
      </div>
    );
  }

  // Redirect to home if user is not authorized
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4 font-sans text-foreground">
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-2">
          <X className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          This portal requires authenticated admin role.
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/95 text-primary-foreground px-6">
            Return to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Brand Logo header */}
        <div className="p-4 border-b border-border flex items-center justify-between h-16 shrink-0">
          <div className={`flex items-center gap-2 ${!sidebarOpen && "justify-center w-full"}`}>
            <Zap className="w-6 h-6 text-primary shrink-0" />
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
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
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
        <div className="border-t border-border p-3 space-y-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent ${!sidebarOpen && "justify-center"}`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="ml-2.5 text-xs font-semibold">Logout</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent ${!sidebarOpen && "justify-center"}`}
          >
            {sidebarOpen ? <X className="w-4 h-4 shrink-0" /> : <Menu className="w-4 h-4 shrink-0" />}
            {sidebarOpen && <span className="ml-2.5 text-xs font-semibold">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation title banner */}
        <header className="bg-card border-b border-border px-6 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Portal</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground h-9 w-9"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main nested layout */}
        <main className="flex-1 overflow-auto bg-background relative">
          <div className="p-6 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
