import React from 'react';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function IssueReader() {
  const [match, params] = useRoute('/:slug');
  const { data: issue } = trpc.public.getIssueBySlug.useQuery(
    { slug: params?.slug || '' },
    { enabled: !!params?.slug }
  );

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </a>
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
            <span>Issue #{issue.issueNumber}</span>
            <span>•</span>
            <span>{issue.readingTimeMinutes} min read</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{issue.title}</h1>
          <p className="text-lg text-slate-300 italic">{issue.previewText}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {issue.coverImageUrl && (
          <img src={issue.coverImageUrl} alt={issue.title} className="w-full rounded-lg mb-8" />
        )}

        <div className="prose prose-invert max-w-none mb-12">
          {issue.webContent && (
            <div dangerouslySetInnerHTML={{ __html: issue.webContent }} className="text-slate-300" />
          )}
        </div>

        {/* Share */}
        <div className="border-t border-slate-800 pt-8 flex items-center gap-4">
          <span className="text-slate-400">Share this issue:</span>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-12 bg-emerald-900/20 border border-emerald-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Love this newsletter?</h2>
          <p className="text-slate-300 mb-4">Subscribe to get the latest issues delivered to your inbox</p>
          <Link href="/subscribe">
            <a>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Subscribe Now</Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
