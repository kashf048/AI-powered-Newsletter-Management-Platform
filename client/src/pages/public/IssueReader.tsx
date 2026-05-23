import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Twitter, Linkedin, Copy, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import DOMPurify from "dompurify";
import { toast } from "sonner";

export default function IssueReader() {
  const [match, params] = useRoute("/:slug");
  const [copied, setCopied] = useState(false);
  
  const { data: issue, isLoading } = useQuery({
    queryKey: ["issue", params?.slug || ""],
    queryFn: () => apiService.public.getIssueBySlug(params?.slug || ""),
    enabled: !!params?.slug,
    refetchOnWindowFocus: false,
  });

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4 font-sans text-foreground">
        <p className="text-muted-foreground text-lg">Issue not found</p>
        <Link href="/issues">
          <Button variant="outline" className="border-border hover:bg-accent text-foreground">
            Browse All Issues
          </Button>
        </Link>
      </div>
    );
  }

  // Sanitize the HTML for security
  const htmlContent = issue.webContent || issue.webContent === "" ? issue.webContent : "";
  const sanitizedHtml = htmlContent ? DOMPurify.sanitize(htmlContent) : "";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/issues">
            <a className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition group cursor-pointer text-sm font-medium">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Archive
            </a>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopyLink} className="text-muted-foreground hover:text-foreground h-9 w-9">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShareTwitter} className="text-muted-foreground hover:text-foreground h-9 w-9">
              <Twitter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShareLinkedIn} className="text-muted-foreground hover:text-foreground h-9 w-9">
              <Linkedin className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Issue Metadata */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-primary">
            <span>Issue #{issue.issueNumber}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{issue.readingTimeMinutes} min read</span>
            {issue.issueDate && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{new Date(issue.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight font-sans">
            {issue.title}
          </h1>
          {issue.previewText && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light font-sans">
              {issue.previewText}
            </p>
          )}
        </div>

        {issue.coverImageUrl && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border shadow-2xl mb-10">
            <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <div className="max-w-none mb-12 font-sans leading-relaxed">
          {sanitizedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="text-foreground leading-relaxed space-y-6" />
          ) : issue.sections && issue.sections.length > 0 ? (
            <div className="space-y-8">
              {issue.sections.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-xl font-bold text-primary font-sans border-b border-border pb-1.5">{sec.title}</h3>
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No web content version available for this issue.</p>
          )}
        </div>

        {/* Subscribe CTA */}
        <div className="mt-16 bg-card border border-border rounded-xl p-8 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 relative z-10 font-sans">
            Stay ahead of the AI curve
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto relative z-10">
            Join thousands of innovators and tech professionals reading Pakistan's premier AI weekly digest.
          </p>
          <Link href="/subscribe">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 font-medium shadow-md relative z-10 transition-colors">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
