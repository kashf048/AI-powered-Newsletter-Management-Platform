import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Bell, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Issues', href: '/admin/issues', icon: '✉️' },
  { label: 'Subscribers', href: '/admin/subscribers', icon: '👥' },
  { label: 'AI Studio', href: '/admin/ai-studio', icon: '🤖', badge: 'NEW' },
  { label: 'Sponsors', href: '/admin/sponsors', icon: '📣' },
  { label: 'Referrals', href: '/admin/referrals', icon: '🏆' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  const logout = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
            <Zap className="w-6 h-6 text-emerald-500" />
            {sidebarOpen && <span className="font-bold text-lg">NexusAI</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}>
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && <span className="text-xs bg-emerald-500 px-2 py-1 rounded">{item.badge}</span>}
                    </>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-slate-300 hover:bg-slate-800 ${!sidebarOpen && 'justify-center'}`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`w-full justify-start text-slate-300 hover:bg-slate-800 ${!sidebarOpen && 'justify-center'}`}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {sidebarOpen && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">NexusAI Digest</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
