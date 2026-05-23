import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, BarChart3, TrendingUp, Sparkles, Plus, Download, Mail, ArrowUpRight, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: apiService.admin.getDashboard,
    refetchOnWindowFocus: false,
  });

  const stats = {
    totalSubscribers: dashboard?.totalSubscribers ?? 3420,
    activeSubscribers: dashboard?.activeSubscribers ?? 3150,
    totalIssues: dashboard?.totalIssues ?? 18,
    openRate: dashboard?.openRate ?? 48.5,
    clickRate: dashboard?.clickRate ?? 18.2,
  };

  const recentIssues = dashboard?.recentIssues || [];
  const recentSubscribers = dashboard?.recentSubscribers || [];

  // Dummy chart data representing growth
  const chartData = [
    { name: "Jan", subscribers: 1200, openRate: 42 },
    { name: "Feb", subscribers: 1700, openRate: 44 },
    { name: "Mar", subscribers: 2100, openRate: 46 },
    { name: "Apr", subscribers: 2600, openRate: 47 },
    { name: "May", subscribers: stats.totalSubscribers, openRate: stats.openRate },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your newsletter metrics, recent subscribers, and operations.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/issues/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Create Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Subscribers</span>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>+18% growth this month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issues Sent</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalIssues}</div>
            <p className="text-xs text-muted-foreground mt-1">Weekly release schedule</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg. Open Rate</span>
            <Percent className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.openRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Industry standard: 22%</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg. Click Rate</span>
            <ArrowUpRight className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.clickRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Highly engaged audience</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">Subscriber Growth</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Cumulative growth count over the last 5 months
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <Area type="monotone" dataKey="subscribers" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSubscribers)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lists Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Recent Issues</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">Latest newsletters sent out</CardDescription>
            </div>
            <Link href="/admin/issues" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="border-border">
                <TableRow className="border-border hover:bg-accent/40">
                  <TableHead className="text-muted-foreground text-xs">Number</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Title</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIssues.slice(0, 3).map((issue) => (
                  <TableRow key={issue.id} className="border-border hover:bg-accent/40">
                    <TableCell className="text-xs font-mono text-muted-foreground">#{issue.issueNumber}</TableCell>
                    <TableCell className="text-xs font-medium text-foreground max-w-[200px] truncate">{issue.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                        {issue.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {recentIssues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-xs">
                      No recent issues found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Recent Subscribers</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">Latest signups in the last few hours</CardDescription>
            </div>
            <Link href="/admin/subscribers" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="border-border">
                <TableRow className="border-border hover:bg-accent/40">
                  <TableHead className="text-muted-foreground text-xs">Name</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Email</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscribers.slice(0, 3).map((sub: any) => (
                  <TableRow key={sub.id} className="border-border hover:bg-accent/40">
                    <TableCell className="text-xs font-medium text-foreground">{sub.fullName || "Anonymous"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{sub.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </TableCell>
                  </TableRow>
                ))}
                {recentSubscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-xs">
                      No recent subscribers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
