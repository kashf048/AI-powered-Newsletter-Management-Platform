import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Copy, Check, FileText, Globe2, BookOpen, Newspaper, Tag, Lightbulb, Languages, RefreshCw, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AIStudio() {
  const [selectedTool, setSelectedTool] = useState("full_writer");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateFullMutation = useMutation({
    mutationFn: apiService.admin.generateFullIssue
  });

  const generateSubjectMutation = useMutation({
    mutationFn: apiService.admin.generateSubjectLines
  });

  const tools = [
    { id: "full_writer", name: "Full Issue Writer", desc: "Drafts a complete 5-section newsletter draft based on a focus topic.", icon: FileText, color: "text-emerald-500 border-emerald-500/10 bg-emerald-500/5" },
    { id: "pakistan_spotlight", name: "Pakistan AI Spotlight", desc: "Focuses specifically on how a tech development affects the Pakistani business ecosystem.", icon: Globe2, color: "text-indigo-500 border-indigo-500/10 bg-indigo-500/5" },
    { id: "deep_dive", name: "Deep Dive Compiler", desc: "Creates an in-depth breakdown of a complex AI concept, paper, or architecture.", icon: BookOpen, color: "text-purple-500 border-purple-500/10 bg-purple-500/5" },
    { id: "news_roundup", name: "News Roundup Writer", desc: "Converts bullet points of global news into a summary.", icon: Newspaper, color: "text-sky-500 border-sky-500/10 bg-sky-500/5" },
    { id: "subject_lines", name: "Subject Line Generator", desc: "Drafts 10 high-CTR email subject lines for Pakistani readers.", icon: Tag, color: "text-amber-500 border-amber-500/10 bg-amber-500/5" },
    { id: "prompt_week", name: "Prompt of the Week", desc: "Drafts copy describing a specific prompt, what it does, and how to use it.", icon: Lightbulb, color: "text-rose-500 border-rose-500/10 bg-rose-500/5" },
    { id: "urdu_translator", name: "Urdu Localization", desc: "Translates and adapts professional terminology into conversational Urdu for regional readers.", icon: Languages, color: "text-teal-500 border-teal-500/10 bg-teal-500/5" },
  ];

  const handleGenerate = async () => {
    if (!topic && selectedTool !== "subject_lines") {
      toast.error("Please enter a topic or context.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      if (selectedTool === "subject_lines") {
        const res = await generateSubjectMutation.mutateAsync({
          issueTitle: topic || "Weekly AI Intelligence",
          previewText: customPrompt || "AI developments in Pakistan",
        });
        if (res && res.subjectLines) {
          setOutput(res.subjectLines.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n"));
        }
      } else {
        const res = await generateFullMutation.mutateAsync({
          issueFocus: topic,
          tone,
          targetAudience: "Pakistani tech ecosystem",
        });
        if (res && res.content) {
          let aiBody = res.content;
          try {
            const parsed = JSON.parse(res.content);
            if (parsed.sections) {
              aiBody = parsed.sections
                .map((s: any) => `## ${s.title}\n\n${s.content}`)
                .join("\n\n");
            }
          } catch {
            // Keep original string if not json
          }
          setOutput(aiBody);
        }
      }
      toast.success("AI draft compiled successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to generate AI draft.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedToolObj = tools.find((t) => t.id === selectedTool) || tools[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" /> AI Studio
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate high-quality newsletter drafts and localize them for your audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tools Selector Grid */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-2">Select AI Tool</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTool(t.id);
                    setOutput("");
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    selectedTool === t.id
                      ? "bg-card border-border shadow-md"
                      : "bg-background/40 border-border/60 hover:border-border hover:bg-card/40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${t.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground leading-tight">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Inputs & Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">Configure {selectedToolObj.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {selectedTool === "subject_lines" ? "Newsletter Main Title" : "Focus Topic / Core Context"}
                </label>
                <Input
                  placeholder={
                    selectedTool === "subject_lines"
                      ? "e.g., Llama 3.3 Urdu localization guide"
                      : "e.g., Airlift founder's new fintech venture Bazaar raising seeds"
                  }
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              {selectedTool !== "subject_lines" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tone & Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["professional", "casual", "developer-focused"].map((t) => (
                      <Button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        variant={tone === t ? "default" : "outline"}
                        className={`h-9 capitalize text-xs ${
                          tone === t
                            ? "bg-primary text-primary-foreground hover:bg-primary/95"
                            : "border-border bg-background/20 text-muted-foreground"
                        }`}
                      >
                        {t.replace("-", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTool === "subject_lines" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview Subtitle (Context)</label>
                  <Input
                    placeholder="e.g., Step-by-step instructions on training small Urdu LLMs locally."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-2 transition-colors font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Drafting content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Compile AI Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Output Result Card */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider">AI Result Draft</CardTitle>
              {output && (
                <Button variant="ghost" size="icon" onClick={handleCopy} className="text-muted-foreground hover:text-foreground h-8 w-8">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {output ? (
                <pre className="p-5 text-foreground text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto bg-background/40">
                  {output}
                </pre>
              ) : (
                <div className="p-8 text-center text-muted-foreground/60 text-xs italic">
                  Draft compiled outputs will show up here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
