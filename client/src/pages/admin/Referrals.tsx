import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Gift, Users, Award, ShieldAlert, Sparkles, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Referrals() {
  const [milestones, setMilestones] = useState([
    { referralsNeeded: 1, title: "AI Prompt Pack", reward: "100+ Prompt Sheets (JSON format)", claimedCount: 142 },
    { referralsNeeded: 3, title: "Agentic Workflows implementation guide", reward: "Deep dive PDF workbook", claimedCount: 48 },
    { referralsNeeded: 5, title: "AI Studio Premium Access", reward: "Beta token API credits", claimedCount: 12 },
  ]);

  const referrers = [
    { rank: 1, fullName: "Hamza Abbasi", email: "hamza@domain.pk", code: "HA0023", referrals: 12, milestoneUnlocked: "AI Studio Premium Access" },
    { rank: 2, fullName: "Kashif Ali", email: "kashif@domain.pk", code: "KA8821", referrals: 8, milestoneUnlocked: "AI Studio Premium Access" },
    { rank: 3, fullName: "Amina Khan", email: "amina@domain.pk", code: "AM8932", referrals: 4, milestoneUnlocked: "Agentic Workflows Guide" },
    { rank: 4, fullName: "Zainab Malik", email: "zainab@domain.pk", code: "ZM4423", referrals: 1, milestoneUnlocked: "AI Prompt Pack" },
    { rank: 5, fullName: "Bilal Ahmed", email: "bilal@domain.pk", code: "BA7781", referrals: 0, milestoneUnlocked: "None" },
  ];

  const totalReferrals = referrers.reduce((acc, curr) => acc + curr.referrals, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-400" /> Referral Rewards
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor community growth, check active referrers, and manage unlocked reward campaigns.
        </p>
      </div>

      {/* Referrals Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Referred Subscribers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalReferrals} Members</div>
            <p className="text-xs text-slate-400 mt-1">Acquired through referral invites</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Referrers</span>
            <Award className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4 Advocates</div>
            <p className="text-xs text-slate-400 mt-1">Members with 1+ successful invites</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rewards Claimed</span>
            <Gift className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">202 Claims</div>
            <p className="text-xs text-slate-400 mt-1">Auto-dispatched via email verify</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Leaderboard Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Referrer Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-slate-800/10">
                    <TableHead className="text-slate-400 text-xs w-16 text-center">Rank</TableHead>
                    <TableHead className="text-slate-400 text-xs">Advocate</TableHead>
                    <TableHead className="text-slate-400 text-xs w-28">Referral Code</TableHead>
                    <TableHead className="text-slate-400 text-xs w-28">Referrals Count</TableHead>
                    <TableHead className="text-slate-400 text-xs">Highest Unlocked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrers.map((r) => (
                    <TableRow key={r.rank} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell className="text-center font-bold text-xs text-slate-350">
                        {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : r.rank}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-white">{r.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-emerald-400 font-semibold">
                        {r.code}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white font-bold">
                        {r.referrals}
                      </TableCell>
                      <TableCell>
                        {r.referrals > 0 ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[10px] px-2 py-0.5">
                            {r.milestoneUnlocked}
                          </Badge>
                        ) : (
                          <span className="text-slate-600 text-xs italic">No milestones</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reward Milestones Catalog List */}
        <div>
          <Card className="bg-slate-900 border-slate-800/80 shadow-md">
            <CardHeader className="pb-3 border-b border-slate-850">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" /> Milestone Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="bg-slate-950/65 border border-slate-850/80 rounded-xl p-4 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{m.title}</span>
                    <Badge className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px]">
                      {m.referralsNeeded} Friend{m.referralsNeeded > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-450 leading-relaxed">{m.reward}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-900/60">
                    <span>Lifetime claims:</span>
                    <span className="font-bold text-slate-300">{m.claimedCount} claims</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
