import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Calendar, Clock, Edit, Eye, Trash, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function IssuesList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: issues, isLoading, refetch } = useQuery({
    queryKey: ["issues"],
    queryFn: apiService.admin.getIssues,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.admin.deleteIssue,
    onSuccess: () => {
      toast.success("Issue deleted successfully");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "Failed to delete issue");
    }
  });

  const filtered = (issues || []).filter((issue) => {
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
    if (confirm("Are you sure you want to delete this issue?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Newsletter Issues</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your newsletter campaign drafts, schedules, and sent newsletters.
          </p>
        </div>
        <Link href="/admin/issues/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Issue
          </Button>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 border border-border rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border-border focus:border-primary pl-10 text-foreground"
          />
          <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3" />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "published", "draft"].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? "default" : "outline"}
              className={`h-9 px-4 capitalize transition-all ${
                statusFilter === status 
                  ? "bg-primary text-primary-foreground hover:bg-primary/95" 
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {status === "published" ? "Published" : status}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-muted-foreground hover:text-foreground shrink-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading issues...</div>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader className="border-border">
              <TableRow className="border-border hover:bg-accent/40">
                <TableHead className="text-muted-foreground text-xs font-semibold w-24">Issue #</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Title</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-32">Reading Time</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-28">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-36">Publish Date</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((issue) => (
                <TableRow key={issue.id} className="border-border hover:bg-accent/40">
                  <TableCell className="font-mono text-muted-foreground">
                    #{issue.issueNumber}
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-sm truncate">
                    {issue.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm flex items-center gap-1.5 py-4">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span>{issue.readingTimeMinutes} min</span>
                  </TableCell>
                  <TableCell>
                    {issue.status === "sent" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/10">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {issue.issueDate || issue.createdAt ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {new Date(issue.issueDate || issue.createdAt || "").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 italic">Not sent</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/${issue.slug}`} target="_blank">
                        <a className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Link>
                      <Link href={`/admin/issues/${issue.id}/edit`}>
                        <a className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                          <Edit className="w-4 h-4" />
                        </a>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(issue.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
          <div className="p-12 text-center text-muted-foreground">
            No issues found matching "{search}" or status filter.
          </div>
        )}
      </div>
    </div>
  );
}
