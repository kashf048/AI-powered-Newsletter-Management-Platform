import React, { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Gift, Mail, Sparkles, Trophy, Users, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ReferralLandingPage() {
  const params = useParams<{ code: string }>();
  const referralCode = params.code || "";

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const subscribeMutation = trpc.public.subscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await subscribeMutation.mutateAsync({
        email,
        fullName: fullName || undefined,
        referralCode,
      });
      setJoined(true);
      toast.success("Welcome! Check your email to confirm.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    { referrals: 1, title: "AI Prompt Pack", desc: "100+ highly optimized prompts for coding & copywriting", icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { referrals: 3, title: "Agentic Workflows Guide", desc: "Step-by-step implementation guide for local multi-agent systems", icon: Gift, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { referrals: 5, title: "NexusAI Premium Access", desc: "Early access to custom localized GPTs and tools in AI Studio", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.2),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        
        {/* Left Side: Welcome Info & Reward Tiers */}
        <div className="flex flex-col justify-center space-y-6">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 group cursor-pointer w-fit">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Back to Home
            </a>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Special Invitation</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight font-sans">
              You've been invited to join <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">NexusAI Digest</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              A friend has invited you to Pakistan's premier briefing on artificial intelligence. 
              Sign up below to claim your invitation and help them unlock exclusive milestone rewards.
            </p>
          </div>

          {/* Reward Tiers Roadmap */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Referral Milestones</h3>
            <div className="space-y-3">
              {tiers.map((t, idx) => {
                const Icon = t.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start bg-slate-900/50 border border-slate-900 rounded-lg p-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${t.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{t.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{t.referrals} Friend{t.referrals > 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-xs text-slate-400">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Signup Card */}
        <div className="flex items-center justify-center">
          <Card className="w-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            
            {!joined ? (
              <CardContent className="pt-8 pb-8 space-y-5">
                <div className="text-center space-y-2">
                  <CardTitle className="text-xl md:text-2xl font-bold text-white">Accept Invitation</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Fill in your details. Referral code <span className="text-emerald-400 font-mono font-semibold">{referralCode}</span> will be auto-applied.
                  </CardDescription>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Mansoor Ali"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-emerald-500 text-white placeholder:text-slate-600 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus:border-emerald-500 text-white placeholder:text-slate-600 pl-10 h-11"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? "Joining..." : "Accept Invitation"}
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secure subscription. Spam-free policy.</span>
                </div>
              </CardContent>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Almost there!</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    We've sent a verification email to <strong className="text-emerald-400 font-semibold">{email}</strong>. 
                    Please click the verification link inside to claim your subscription and support your friend!
                  </p>
                </div>
                <Link href="/">
                  <a className="inline-block w-full">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300">
                      Explore Latest Issues
                    </Button>
                  </a>
                </Link>
              </motion.div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
