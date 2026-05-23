import React, { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Calendar, Clock, ChevronRight, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export default function IssuesArchive() {
  const [search, setSearch] = useState("");
  const { data: issues, isLoading } = useQuery({
    queryKey: ["latestIssues", 100],
    queryFn: () => apiService.public.getLatestIssues(100),
    refetchOnWindowFocus: false,
  });

  const filtered = (issues || []).filter((issue) => {
    const term = search.toLowerCase();
    return (
      issue.title.toLowerCase().includes(term) ||
      (issue.previewText || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition group cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> 
              Back to Home
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-sans mt-1">
              Newsletter Archive
            </h1>
          </div>

          <div className="relative w-full md:max-w-xs">
            <Input
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 pl-10 h-10 w-full"
            />
            <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="bg-card border-border h-72 animate-pulse">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  <div className="w-full h-40 bg-accent/25" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-accent/25 rounded w-1/4" />
                    <div className="h-6 bg-accent/25 rounded w-3/4" />
                    <div className="h-4 bg-accent/25 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map((issue) => (
              <Link key={issue.id} href={`/${issue.slug}`} className="group block cursor-pointer">
                <div className="bg-card border border-border hover:border-primary/30 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  {issue.coverImageUrl ? (
                    <div className="relative h-40 w-full overflow-hidden border-b border-border">
                      <img
                        src={issue.coverImageUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="relative h-40 w-full overflow-hidden bg-accent/20 border-b border-border flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                      <span>Issue #{issue.issueNumber}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {issue.readingTimeMinutes}m read</span>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {issue.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-sans">
                      {issue.previewText}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground font-medium pt-2 border-t border-border/80 justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Draft"}
                      </span>
                      <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Read Issue <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl max-w-lg mx-auto">
            <Search className="w-10 h-10 text-muted-foreground/45 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-1">No issues found</h3>
            <p className="text-muted-foreground text-sm">
              We couldn't find any issues matching "{search}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
