import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Twitter, Linkedin, Copy, Check, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DOMPurify from "dompurify";
import { toast } from "sonner";

export default function IssueReader() {
  const [match, params] = useRoute("/:slug");
  const [copied, setCopied] = useState(false);
  const { data: issue, isLoading } = trpc.public.getIssueBySlug.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug } as any
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    if (!issue) return;
    const text = encodeURIComponent(`Check out this issue of NexusAI Digest: "${issue.title}"`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    if (!issue) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-slate-400 text-lg">Issue not found</p>
        <Link href="/issues">
          <Button variant="outline" className="border-slate-800 hover:bg-slate-900 text-white">
            Browse All Issues
          </Button>
        </Link>
      </div>
    );
  }

  // Sanitize the HTML for security
  const sanitizedHtml = DOMPurify.sanitize(issue.webContent || "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/issues">
            <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition group cursor-pointer text-sm font-medium">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Archive
            </a>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopyLink} className="text-slate-400 hover:text-white h-9 w-9">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShareTwitter} className="text-slate-400 hover:text-white h-9 w-9">
              <Twitter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShareLinkedIn} className="text-slate-400 hover:text-white h-9 w-9">
              <Linkedin className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Issue Metadata */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span>Issue #{issue.issueNumber}</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>{issue.readingTimeMinutes} min read</span>
            {issue.createdAt && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>{new Date(issue.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight font-sans">
            {issue.title}
          </h1>
          {issue.previewText && (
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">
              {issue.previewText}
            </p>
          )}
        </div>

        {issue.coverImageUrl && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl mb-10">
            <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <div className="prose prose-invert prose-slate max-w-none mb-12 prose-headings:font-sans prose-headings:font-bold prose-a:text-emerald-400 hover:prose-a:text-emerald-300">
          {sanitizedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="text-slate-300 leading-relaxed space-y-6" />
          ) : (
            <p className="text-slate-500 italic">No web content version available for this issue.</p>
          )}
        </div>

        {/* Subscribe CTA */}
        <div className="mt-16 bg-slate-900 border border-slate-800 rounded-xl p-8 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 relative z-10 font-sans">
            Stay ahead of the AI curve
          </h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto relative z-10">
            Join thousands of innovators and tech professionals reading Pakistan's premier AI weekly digest.
          </p>
          <Link href="/subscribe">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 font-medium shadow-md shadow-emerald-900/20 relative z-10 transition-colors">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
