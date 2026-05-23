import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Zap, TrendingUp, Users, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const subscribe = trpc.public.subscribe.useMutation();
  const { data: analytics } = trpc.public.getAnalytics.useQuery();
  const { data: latestIssues } = trpc.public.getLatestIssues.useQuery({ limit: 3 });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await subscribe.mutateAsync({ email });
      toast.success('Check your email to confirm!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Zap className="w-8 h-8 text-emerald-500" />
            <span className="text-white">NexusAI Digest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/issues">
              <a className="text-slate-300 hover:text-white transition">Issues</a>
            </Link>
            <Link href="/subscribe">
              <a>
                <Button variant="default" size="sm">Subscribe</Button>
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            AI Intelligence,<br />Delivered Weekly
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Pakistan's first AI newsletter for business leaders. No jargon. No fluff. Just what matters — and how it affects YOU.
          </p>
        </div>

        {/* Subscribe Form */}
        <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-12 flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            disabled={loading}
          />
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? 'Subscribing...' : 'Subscribe Free'}
          </Button>
        </form>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-8 text-slate-400 text-sm mb-16">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{analytics?.totalSubscribers || '3,200'}+ Subscribers</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Weekly Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Free</span>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">What's Inside Every Issue</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🔥', title: 'AI News Roundup', desc: 'Latest breakthroughs & trends' },
            { icon: '🇵🇰', title: 'Pakistan AI Spotlight', desc: 'Local impact & opportunities' },
            { icon: '📊', title: 'Deep Dives', desc: 'In-depth analysis & insights' },
            { icon: '🛠️', title: 'Tool of the Week', desc: 'Practical AI tools to try' },
            { icon: '💡', title: 'Prompt of the Week', desc: 'Ready-to-use AI prompts' },
            { icon: '📣', title: 'Sponsor Picks', desc: 'Curated products & services' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-600 transition">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Issues */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-8">Latest Issues</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {latestIssues?.map((issue) => (
            <Link key={issue.id} href={`/${issue.slug}`}>
              <a className="group bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-emerald-600 transition">
                {issue.coverImageUrl && (
                  <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <div className="text-sm text-emerald-400 mb-2">Issue #{issue.issueNumber}</div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition mb-2">{issue.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{issue.previewText}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{issue.readingTimeMinutes} min read</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/issues">
            <a className="text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2">
              View All Issues <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </section>

      {/* Referral Program */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-900/10 border border-emerald-800 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Share & Earn Rewards</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Refer friends to NexusAI Digest and unlock exclusive rewards. Get AI prompt packs, premium access, and more!
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { count: 3, reward: '🎁 AI Prompt Pack' },
              { count: 10, reward: '⭐ 1 Month Premium' },
              { count: 25, reward: '🏆 NexusAI Merch' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded p-4">
                <div className="text-2xl font-bold text-emerald-400 mb-2">{item.count}</div>
                <div className="text-slate-300">{item.reward}</div>
              </div>
            ))}
          </div>
          <Link href="/subscribe">
            <a>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Get Your Referral Link</Button>
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-white">NexusAI</span>
              </div>
              <p className="text-slate-400 text-sm">Pakistan's premier AI newsletter</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/issues"><a className="hover:text-white">Issues</a></Link></li>
                <li><Link href="/subscribe"><a className="hover:text-white">Subscribe</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Connect</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2026 NexusAI Digest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
