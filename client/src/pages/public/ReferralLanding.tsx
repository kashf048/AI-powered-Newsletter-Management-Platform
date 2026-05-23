import React, { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Gift, Mail, Sparkles, Trophy, Users, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ReferralLandingPage() {
  const params = useParams<{ code: string }>();
  const referralCode = params.code || "";

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: apiService.public.subscribe
  });

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
      const msg = err.response?.data?.detail || err.message || "Failed to subscribe. Please try again.";
      toast.error(msg);
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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.1),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        
        {/* Left Side: Welcome Info & Reward Tiers */}
        <div className="flex flex-col justify-center space-y-6">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group cursor-pointer w-fit">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Back to Home
            </a>
          </Link>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Special Invitation</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight font-sans">
              You've been invited to join <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-primary">NexusAI Digest</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A friend has invited you to Pakistan's premier briefing on artificial intelligence. 
              Sign up below to claim your invitation and help them unlock exclusive milestone rewards.
            </p>
          </div>

          {/* Reward Tiers Roadmap */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Referral Milestones</h3>
            <div className="space-y-3">
              {tiers.map((t, idx) => {
                const Icon = t.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start bg-card border border-border rounded-lg p-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${t.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{t.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground border border-border">{t.referrals} Friend{t.referrals > 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Subscription Form Card */}
        <div className="flex flex-col justify-center">
          <Card className="bg-card border border-border backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            
            {!joined ? (
              <CardContent className="pt-8 pb-8 space-y-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl md:text-2xl font-bold font-sans">Claim Invitation</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs mt-1.5">
                    Your subscription will start immediately, 100% free forever.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name (Optional)
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Mansoor Ali"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 pl-10 h-11"
                      />
                      <Users className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 pl-10 h-11"
                        required
                      />
                      <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Referred By Code
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={referralCode}
                        className="bg-background/50 border-border text-muted-foreground pl-10 h-11"
                        disabled
                      />
                      <Gift className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 transition-all duration-200">
                    {loading ? "Claiming..." : "Claim Invitation & Subscribe"}
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified free subscription.</span>
                </div>
              </CardContent>
            ) : (
              <CardContent className="pt-12 pb-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold font-sans text-foreground">Welcome Aboard!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  We've sent a verification link to <strong className="text-primary font-semibold">{email}</strong>. 
                  Please confirm your email address to active your digest subscription and credit your referrer.
                </p>
                <Link href="/">
                  <a className="inline-block mt-4">
                    <Button variant="outline" className="border-border hover:bg-accent text-muted-foreground hover:text-foreground">
                      Go to Homepage
                    </Button>
                  </a>
                </Link>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
