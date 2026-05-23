import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from "recharts";
import { BarChart3, TrendingUp, Mail, Users, ArrowUpRight, PieChart } from "lucide-react";

export default function Analytics() {
  // Mock data for weekly issue performance
  const issuePerformance = [
    { issue: "Issue #13", openRate: 46.2, clickRate: 14.5 },
    { issue: "Issue #14", openRate: 48.0, clickRate: 15.2 },
    { issue: "Issue #15", openRate: 47.5, clickRate: 16.8 },
    { issue: "Issue #16", openRate: 49.1, clickRate: 17.5 },
    { issue: "Issue #17", openRate: 48.5, clickRate: 18.2 },
  ];

  // Mock data for source attribution
  const sourcesData = [
    { source: "Website Signup", count: 1820, color: "#10b981" },
    { source: "Referral Invites", count: 1250, color: "#6366f1" },
    { source: "LinkedIn Shares", count: 350, color: "#0ea5e9" },
  ];

  // Cumulative subscriber growth
  const growthData = [
    { week: "Week 1", count: 2800 },
    { week: "Week 2", count: 2950 },
    { week: "Week 3", count: 3120 },
    { week: "Week 4", count: 3290 },
    { week: "Week 5", count: 3420 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-emerald-400" /> Newsletter Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Detailed metrics showing reader retention, campaign delivery, and source attributions.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average CTR</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">16.4%</div>
            <p className="text-xs text-slate-400 mt-1">Avg link clicks per issue delivery</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bounce Rate</span>
            <Mail className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0.3%</div>
            <p className="text-xs text-slate-400 mt-1">Extremely clean email sender reputation</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Viral Factor</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1.34x</div>
            <p className="text-xs text-slate-400 mt-1">Average refers generated per active user</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open & Click Rates Bar Chart */}
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Issue Engagement Metrics</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Comparing open rates vs click-through rates across historical issues</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="issue" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="openRate" name="Open Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clickRate" name="Click Rate (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Over Time Line Chart */}
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Cumulative Subscriber Growth</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Total verified active subscriber base mapped weekly</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attribution Sources */}
      <Card className="bg-slate-900 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white">Subscriber Attribution Channels</CardTitle>
          <CardDescription className="text-slate-400 text-xs">Which marketing campaigns or channels drive the most signups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sourcesData.map((s, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{s.source}</span>
                <span className="text-slate-450 font-bold font-mono">
                  {s.count.toLocaleString()} ({(
                    (s.count / sourcesData.reduce((acc, curr) => acc + curr.count, 0)) *
                    100
                  ).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (s.count / sourcesData.reduce((acc, curr) => acc + curr.count, 0)) *
                      100
                    }%`,
                    backgroundColor: s.color,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
