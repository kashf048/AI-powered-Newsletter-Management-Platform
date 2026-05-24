import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Sparkles, Eye, Code, Loader2, Play } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService, IssueSection } from "@/lib/api";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function IssueEditor() {
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;
  const issueId = isEdit ? parseInt(params.id!) : null;
  const [, setLocation] = useLocation();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [issueNumber, setIssueNumber] = useState(19);
  const [readingTime, setReadingTime] = useState(5);
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [aiFocus, setAiFocus] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch issue data if in edit mode
  const { data: issue, isLoading: isLoadingIssue } = useQuery({
    queryKey: ["adminIssue", issueId],
    queryFn: () => apiService.admin.getIssue(issueId!),
    enabled: isEdit && !!issueId,
    refetchOnWindowFocus: false,
  });

  // Populate state on load
  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setSlug(issue.slug);
      setPreviewText(issue.previewText || "");
      setIssueNumber(issue.issueNumber);
      setReadingTime(issue.readingTimeMinutes);
      setCoverImageUrl(issue.coverImageUrl || "");
      
      // Reconstruct single markdown body from sections or display webContent
      if (issue.sections && issue.sections.length > 0) {
        // Look for the custom section containing content
        const customSec = issue.sections.find(s => s.sectionType === "custom");
        if (customSec) {
          setContent(customSec.content || "");
        } else {
          // Fallback: concatenate all sections
          setContent(issue.sections.map(s => `## ${s.title}\n\n${s.content || ""}`).join("\n\n"));
        }
      } else {
        setContent(issue.webContent || "");
      }
    }
  }, [issue]);

  const createMutation = useMutation({
    mutationFn: apiService.admin.createIssue,
    onSuccess: () => {
      toast.success("Issue created successfully!");
      setLocation("/admin/issues");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "Failed to create issue");
      setSaving(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => apiService.admin.updateIssue(id, payload),
    onSuccess: () => {
      toast.success("Issue updated successfully!");
      setLocation("/admin/issues");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "Failed to update issue");
      setSaving(false);
    }
  });

  const generateAiMutation = useMutation({
    mutationFn: apiService.admin.generateFullIssue,
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "AI Generation failed");
      setAiLoading(false);
    }
  });

  // Handle Slug generation on title change
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // Save changes mutation trigger
  const handleSave = async (status: "draft" | "sent") => {
    if (!title || !previewText) {
      toast.error("Please enter a title and preview subtitle");
      return;
    }

    setSaving(true);
    
    // Structure content inside a custom section for database structure compatibility
    const sections: IssueSection[] = [
      {
        sectionType: "custom",
        title: "Newsletter Content",
        content: content,
        orderIndex: 0,
      }
    ];

    const payload = {
      title,
      slug,
      previewText,
      issueNumber,
      readingTimeMinutes: readingTime,
      coverImageUrl: coverImageUrl || null,
      status,
      sections,
    };

    if (isEdit && issueId) {
      updateMutation.mutate({ id: issueId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // AI Prompt compiler
  const handleAiGenerate = async () => {
    if (!aiFocus) {
      toast.error("Please enter what you want the AI to write about.");
      return;
    }

    setAiLoading(true);
    generateAiMutation.mutate(
      {
        issueFocus: aiFocus,
        tone: "professional",
        targetAudience: "Pakistani tech innovators",
      },
      {
        onSuccess: (response) => {
          if (response && response.content) {
            let aiBody = response.content;
            try {
              const parsed = JSON.parse(response.content);
              if (parsed.sections) {
                aiBody = parsed.sections
                  .map((s: any) => `## ${s.title}\n\n${s.content}`)
                  .join("\n\n");
              }
            } catch {
              // If not JSON, use direct content
            }
            setContent((prev) => prev + "\n\n" + aiBody);
            toast.success("AI Content added at the bottom of your draft!");
          }
          setAiLoading(false);
        }
      }
    );
  };

  if (isEdit && isLoadingIssue) {
    return <div className="p-8 text-center text-slate-400">Loading issue details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/issues">
            <a className="inline-flex items-center justify-center border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg h-9 w-9 cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
              {isEdit ? "Edit Issue" : "Create Issue"}
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleSave("draft")}
            variant="outline"
            className="border-slate-800 hover:bg-slate-800 text-slate-300 h-9 transition-colors"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Draft
          </Button>
          <Button
            onClick={() => handleSave("sent")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 transition-colors"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />} Publish Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Issue Form & Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800/80">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue #</label>
                  <Input
                    type="number"
                    value={issueNumber}
                    onChange={(e) => setIssueNumber(parseInt(e.target.value))}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue Title</label>
                  <Input
                    type="text"
                    placeholder="Enter issue headline"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slug Path</label>
                  <Input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-slate-950 border-slate-800 font-mono text-xs text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cover Image URL</label>
                  <Input
                    type="text"
                    placeholder="https://unsplash.com/..."
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview Subtitle</label>
                <Input
                  type="text"
                  placeholder="Summarize the core topics in 1 sentence..."
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Markdown Content Pane */}
          <Card className="bg-slate-900 border-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-850">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold text-white">Newsletter Content</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Write your body copy using standard Markdown syntax.</CardDescription>
              </div>
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                <Button
                  onClick={() => setMode("edit")}
                  variant="ghost"
                  className={`h-7 px-3 text-xs ${mode === "edit" ? "bg-slate-850 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Code className="w-3.5 h-3.5 mr-1.5" /> Markdown
                </Button>
                <Button
                  onClick={() => setMode("preview")}
                  variant="ghost"
                  className={`h-7 px-3 text-xs ${mode === "preview" ? "bg-slate-850 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {mode === "edit" ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="## Weekly Spotlight... write Markdown here."
                  className="w-full h-[400px] bg-slate-950/40 focus:outline-none p-5 text-sm font-mono text-slate-300 leading-relaxed resize-y border-0 border-t border-slate-900"
                />
              ) : (
                <div className="p-6 h-[400px] overflow-y-auto border-t border-slate-900 prose prose-invert max-w-none">
                  {content ? (
                    <Streamdown>{content}</Streamdown>
                  ) : (
                    <p className="text-slate-600 italic text-sm">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: AI Writer Companion */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800/80 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <CardTitle className="text-base font-bold text-white">AI Writing Assistant</CardTitle>
              </div>
              <CardDescription className="text-slate-400 text-xs">
                Describe the topic you want to write about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Write a section about Bazaar raising seed capital, and relate it to the local logistics AI opportunities..."
                value={aiFocus}
                onChange={(e) => setAiFocus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-lg p-3 text-xs text-white placeholder:text-slate-600 min-h-[120px] resize-none"
              />
              <Button
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-2 transition-all font-semibold"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
