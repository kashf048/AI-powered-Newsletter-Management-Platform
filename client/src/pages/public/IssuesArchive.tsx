import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function IssuesArchive() {
  const { data: issues } = trpc.public.getLatestIssues.useQuery({ limit: 50 });
  const [search, setSearch] = React.useState('');

  const filtered = issues?.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.previewText?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>
          </Link>
          <h1 className="text-4xl font-bold text-white">All Issues</h1>
          <p className="text-slate-400 mt-2">Browse our complete archive of newsletters</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Input
          placeholder="Search issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white max-w-md"
        />
      </div>

      {/* Issues Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((issue) => (
            <Link key={issue.id} href={`/${issue.slug}`}>
              <a className="group bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-emerald-600 transition">
                {issue.coverImageUrl && (
                  <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <div className="text-sm text-emerald-400 mb-2">Issue #{issue.issueNumber}</div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition">{issue.title}</h3>
                  <p className="text-slate-400 text-sm mt-2">{issue.previewText}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No issues found</p>
          </div>
        )}
      </div>
    </div>
  );
}
