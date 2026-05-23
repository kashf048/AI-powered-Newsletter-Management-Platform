import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, BarChart3, TrendingUp, Sparkles, Plus, Download, Mail, ArrowUpRight, Percent } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboard, isLoading } = trpc.admin.getDashboard.useQuery(undefined, {
    refetchOnWindowFocus: false,
  } as any);

  const stats = {
    totalSubscribers: (dashboard as any)?.totalSubscribers ?? 3420,
    activeSubscribers: (dashboard as any)?.activeSubscribers ?? 3150,
    totalIssues: (dashboard as any)?.totalIssues ?? 18,
    openRate: (dashboard as any)?.openRate ?? 48.5,
    clickRate: (dashboard as any)?.clickRate ?? 18.2,
  };

  const recentIssues = (dashboard?.recentIssues || [
    { id: 1, title: "Pakistan's AI Freelancer Boom", issueNumber: 18, status: "sent" as const, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 2, title: "Urdu LLM fine-tuning guide", issueNumber: 17, status: "sent" as const, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 3, title: "Agentic Workflows in Logistics", issueNumber: 16, status: "sent" as const, createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() },
  ]) as any[];

  const recentSubscribers = (dashboard as any)?.recentSubscribers || [
    { id: 1, fullName: "Amina Khan", email: "amina@domain.pk", status: "active", createdAt: new Date().toISOString() },
    { id: 2, fullName: "Zainab Malik", email: "zainab@domain.pk", status: "active", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, fullName: "Bilal Ahmed", email: "bilal@domain.pk", status: "active", createdAt: new Date(Date.now() - 7200000).toISOString() },
  ];

  // Dummy chart data representing growth
  const chartData = [
    { name: "Jan", subscribers: 1200, openRate: 42 },
    { name: "Feb", subscribers: 1700, openRate: 44 },
    { name: "Mar", subscribers: 2100, openRate: 46 },
    { name: "Apr", subscribers: 2600, openRate: 47 },
    { name: "May", subscribers: 3420, openRate: 48.5 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-slate-800" />
            <Skeleton className="h-4 w-72 bg-slate-800" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of your newsletter metrics, recent subscribers, and operations.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/issues/new">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Create Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Subscribers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>+18% growth this month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issues Sent</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalIssues}</div>
            <p className="text-xs text-slate-400 mt-1">Weekly release schedule</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg. Open Rate</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.openRate}%</div>
            <p className="text-xs text-slate-400 mt-1">Industry standard: 22%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg. Click Rate</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.clickRate}%</div>
            <p className="text-xs text-slate-400 mt-1">Highly engaged audience</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="bg-slate-900 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Subscriber Growth</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Cumulative growth count over the last 5 months
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area type="monotone" dataKey="subscribers" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSubscribers)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lists Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-white">Recent Issues</CardTitle>
              <CardDescription className="text-slate-400 text-xs">Latest newsletters sent out</CardDescription>
            </div>
            <Link href="/admin/issues" className="text-xs text-emerald-400 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="border-slate-800">
                <TableRow className="border-slate-800 hover:bg-slate-800/20">
                  <TableHead className="text-slate-400 text-xs">Number</TableHead>
                  <TableHead className="text-slate-400 text-xs">Title</TableHead>
                  <TableHead className="text-slate-400 text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIssues.slice(0, 3).map((issue) => (
                  <TableRow key={issue.id} className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell className="text-xs font-mono text-slate-300">#{issue.issueNumber}</TableCell>
                    <TableCell className="text-xs font-medium text-white max-w-[200px] truncate">{issue.title}</TableCell>
                    <TableCell className="text-xs text-slate-400 capitalize">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                        {issue.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-white">Recent Subscribers</CardTitle>
              <CardDescription className="text-slate-400 text-xs">Latest signups in the last few hours</CardDescription>
            </div>
            <Link href="/admin/subscribers" className="text-xs text-emerald-400 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="border-slate-800">
                <TableRow className="border-slate-800 hover:bg-slate-800/20">
                  <TableHead className="text-slate-400 text-xs">Name</TableHead>
                  <TableHead className="text-slate-400 text-xs">Email</TableHead>
                  <TableHead className="text-slate-400 text-xs">Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscribers.slice(0, 3).map((sub: any) => (
                  <TableRow key={sub.id} className="border-slate-800 hover:bg-slate-800/20">
                    <TableCell className="text-xs font-medium text-white">{sub.fullName || "Anonymous"}</TableCell>
                    <TableCell className="text-xs text-slate-300 font-mono">{sub.email}</TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
