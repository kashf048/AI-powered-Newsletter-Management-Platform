import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap, TrendingUp, Users, Sparkles, BookOpen, Clock, ChevronRight, Gift, Trophy, Sun, Moon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const subscribe = useMutation({
    mutationFn: apiService.public.subscribe
  });

  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: apiService.public.getAnalytics,
    refetchOnWindowFocus: false,
  });

  const { data: latestIssues } = useQuery({
    queryKey: ["latestIssues", 3],
    queryFn: () => apiService.public.getLatestIssues(3),
    refetchOnWindowFocus: false,
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await subscribe.mutateAsync({ email });
      toast.success("Check your email to confirm your subscription!");
      setEmail("");
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || "Failed to subscribe. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "🔥", title: "AI News Roundup", desc: "The most important global AI developments translated into practical context." },
    { icon: "🇵🇰", title: "Pakistan AI Spotlight", desc: "How regional startups, developers, and regulations are shaping local AI." },
    { icon: "📊", title: "In-Depth Analyses", desc: "Clear, zero-fluff breakdowns of model architectures and performance." },
    { icon: "🛠️", title: "Tool of the Week", desc: "Curated tools and libraries that you can integrate into your workflow today." },
    { icon: "💡", title: "Prompt of the Week", desc: "Optimized ready-to-copy prompts to supercharge your daily tasks." },
    { icon: "📣", title: "Sponsorship Opportunities", desc: "Connecting local founders and tech companies with the community." },
  ];

  const rewards = [
    { referrals: 1, reward: "AI Prompt Pack (100+ items)", desc: "Copy-paste prompts for development and marketing" },
    { referrals: 3, reward: "Agentic Workflows implementation guide", desc: "PDF blueprint for building local multi-agent teams" },
    { referrals: 5, reward: "AI Studio Premium Access", desc: "Early trial of customized GPT systems and Urdu LLMs" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden transition-colors duration-200">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold cursor-pointer group">
            <Zap className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-foreground font-sans tracking-tight">NexusAI <span className="text-muted-foreground font-light">Digest</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/issues" className="text-sm font-medium text-muted-foreground hover:text-foreground transition cursor-pointer">
              Archive
            </Link>
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
            <Link href="/subscribe" className="cursor-pointer">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
                Subscribe
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Weekly AI Intelligence briefing</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight font-sans max-w-3xl mx-auto">
            Practical AI Insights for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-primary to-indigo-500">Pakistani Innovators</span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Stay ahead of the curve. No fluff, no jargon. Just the absolute best AI workflows, tool guides, and local dev spotlights.
          </p>
        </motion.div>

        {/* Subscribe Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10"
        >
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2 p-1.5 bg-card border border-border rounded-xl focus-within:border-primary/50 transition-colors">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60 h-10 w-full"
              disabled={loading}
              required
            />
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 h-10 transition-colors shrink-0">
              {loading ? "Joining..." : "Subscribe Free"}
            </Button>
          </form>
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-muted-foreground text-xs font-semibold uppercase tracking-wider mt-12"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>{analytics?.totalSubscribers || 1420}+ subscribers</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border hidden md:block" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Weekly issues</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-border hidden md:block" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>100% Free digest</span>
          </div>
        </motion.div>
      </section>

      {/* Featured Latest Issues */}
      {latestIssues && latestIssues.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Latest Issues</h2>
            <Link href="/issues" className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1 group cursor-pointer">
              View Archive <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {latestIssues.map((issue) => (
              <Link key={issue.id} href={`/${issue.slug}`} className="group block cursor-pointer">
                <div className="bg-card border border-border hover:border-primary/30 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  {issue.coverImageUrl ? (
                    <div className="relative h-40 w-full overflow-hidden border-b border-border">
                      <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="relative h-40 w-full overflow-hidden bg-accent/20 border-b border-border flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                      <span>Issue #{issue.issueNumber}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span>{issue.readingTimeMinutes} min read</span>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{issue.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{issue.previewText}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* What's Inside Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-border">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">What's Inside Every Issue</h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            We review hundreds of papers, tools, and local news points to distill the absolute best insights for you.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item, i) => (
            <div key={i} className="bg-card border border-border hover:border-primary/20 rounded-xl p-6 transition-colors duration-200">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Referral Rewards Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-border">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Referral Program</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              Share NexusAI & Unlock Exclusive Perks
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              When you invite your friends to join, you unlock specialized resources. It's our way of saying thanks for helping grow Pakistan's AI community.
            </p>
            <Link href="/subscribe">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm">
                Get Your Referral Link
              </Button>
            </Link>
          </div>

          <div className="space-y-4 bg-background/50 border border-border rounded-xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/75">Reward Milestones</h3>
            <div className="space-y-4">
              {rewards.map((r, idx) => (
                <div key={idx} className="flex gap-4 items-start border-b border-border/50 last:border-0 pb-3 last:pb-0">
                  <div className="text-sm font-bold text-primary bg-primary/5 border border-primary/10 rounded-lg px-2.5 py-1 select-none shrink-0 font-mono">
                    {r.referrals}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold leading-tight">{r.reward}</h4>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 mt-16 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-bold tracking-tight">NexusAI <span className="text-muted-foreground font-light">Digest</span></span>
              </div>
              <p className="text-muted-foreground/60 text-xs">Pakistan's premier briefing on artificial intelligence and workflows.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Newsletter</h4>
              <ul className="space-y-2 text-xs text-muted-foreground/75 font-medium">
                <li><Link href="/issues" className="hover:text-foreground transition">Archive</Link></li>
                <li><Link href="/subscribe" className="hover:text-foreground transition">Subscribe</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground/75 font-medium">
                <li><a href="#" className="hover:text-foreground transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Connect</h4>
              <ul className="space-y-2 text-xs text-muted-foreground/75 font-medium">
                <li><a href="#" className="hover:text-foreground transition">Twitter / X</a></li>
                <li><a href="#" className="hover:text-foreground transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/60 pt-8 text-center text-muted-foreground/50 text-xs font-medium">
            <p>&copy; {new Date().getFullYear()} NexusAI Digest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
