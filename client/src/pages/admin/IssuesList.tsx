import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Calendar, Clock, Edit, Eye, Trash, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function IssuesList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: dbIssues, isLoading, refetch } = trpc.admin.getIssues.useQuery(undefined, {
    refetchOnWindowFocus: false,
  } as any);

  // Mock fallback issues for local/offline testing
  const mockIssues = [
    {
      id: 1,
      title: "Pakistan's AI Freelancer Boom: Essential Coding Tools",
      slug: "pakistan-ai-freelancing-boom",
      issueNumber: 18,
      status: "sent" as const,
      readingTimeMinutes: 5,
      previewText: "Discover how AI code generators are helping local developers win more high-paying international projects.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: "Fine-Tuning Llama Models for Regional Urdu Dialects",
      slug: "urdu-llm-fine-tuning-guide",
      issueNumber: 17,
      status: "sent" as const,
      readingTimeMinutes: 7,
      previewText: "A walkthrough on training small open-source LLMs on local cultural nuances and Urdu script.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      title: "Agentic Workflows in Logistics and Supply Chain Automation",
      slug: "agentic-workflows-logistics",
      issueNumber: 16,
      status: "sent" as const,
      readingTimeMinutes: 6,
      previewText: "How local last-mile delivery services can deploy multi-agent loops to optimize routing.",
      createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      title: "Fintech Agent Integration: Sadapay and AI Wallet Assistants",
      slug: "fintech-agent-integration",
      issueNumber: 19,
      status: "draft" as const,
      readingTimeMinutes: 4,
      previewText: "Draft analyzing the impact of LLM assistant features in Pakistani consumer banking applications.",
      createdAt: new Date().toISOString(),
    }
  ];

  const issues = (dbIssues && dbIssues.length > 0) ? dbIssues : mockIssues;

  const filtered = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      (issue.previewText || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && issue.status === "sent") ||
      (statusFilter === "draft" && issue.status === "draft");

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    toast.success(`Deleted issue #${id} (Simulation)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Newsletter Issues</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your newsletter campaign drafts, schedules, and sent newsletters.
          </p>
        </div>
        <Link href="/admin/issues/new">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Issue
          </Button>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border-slate-800 focus:border-emerald-500 pl-10 text-white"
          />
          <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "published", "draft"].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? "default" : "outline"}
              className={`h-9 px-4 capitalize transition-all ${
                statusFilter === status 
                  ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700" 
                  : "border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {status === "published" ? "Published" : status}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-slate-400 hover:text-white shrink-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-slate-900/60 border border-slate-900 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading issues...</div>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-slate-800/10">
                <TableHead className="text-slate-400 text-xs font-semibold w-24">Issue #</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Title</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-32">Reading Time</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-28">Status</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-36">Publish Date</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((issue) => (
                <TableRow key={issue.id} className="border-slate-800 hover:bg-slate-800/20">
                  <TableCell className="font-mono text-slate-300">
                    #{issue.issueNumber}
                  </TableCell>
                  <TableCell className="font-medium text-white max-w-sm truncate">
                    {issue.title}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm flex items-center gap-1.5 py-4">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{issue.readingTimeMinutes} min</span>
                  </TableCell>
                  <TableCell>
                    {issue.status === "sent" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/10">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {issue.createdAt ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Not sent</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/${issue.slug}`} target="_blank">
                        <a className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Link>
                      <Link href={`/admin/issues/${issue.id}/edit`}>
                        <a className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                          <Edit className="w-4 h-4" />
                        </a>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(issue.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No issues found matching "{search}" or status filter.
          </div>
        )}
      </div>
    </div>
  );
}
