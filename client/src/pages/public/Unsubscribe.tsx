import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Frown, CheckCircle, Mail, AlertTriangle } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await apiService.public.unsubscribe(email);
      setLoading(false);
      setStatus("success");
      toast.success("You have been unsubscribed.");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Failed to unsubscribe. Please try again.";
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    setLoading(true);
    try {
      await apiService.public.subscribe({ email });
      setLoading(false);
      setStatus("form");
      toast.success("Welcome back! You have resubscribed.");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Failed to resubscribe.";
      toast.error(msg);
      setLoading(false);
    }
  };

  const reasons = [
    { value: "too_frequent", label: "Emails are too frequent" },
    { value: "irrelevant", label: "Content is no longer relevant to me" },
    { value: "no_time", label: "I don't have time to read it" },
    { value: "other", label: "Other (please specify below)" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.1),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 group cursor-pointer">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Home
          </a>
        </Link>

        <Card className="bg-card border border-border backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />

          <AnimatePresence mode="wait">
            {status === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pt-8 pb-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <Frown className="w-6 h-6 text-destructive" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-foreground font-sans">
                    Unsubscribe
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-2">
                    We're sorry to see you go. Let us know how we can improve.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleUnsubscribe} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="you@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-background border-border focus:border-destructive text-foreground placeholder:text-muted-foreground/60 pl-10 h-11"
                          required
                        />
                        <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Reason for leaving
                      </label>
                      <div className="space-y-2">
                        {reasons.map((r) => (
                          <label key={r.value} className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:bg-accent/40 cursor-pointer transition">
                            <input
                              type="radio"
                              name="reason"
                              value={r.value}
                              checked={reason === r.value}
                              onChange={() => setReason(r.value)}
                              className="text-destructive focus:ring-destructive"
                            />
                            <span className="text-sm font-medium text-foreground">{r.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {reason === "other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        <textarea
                          placeholder="Please let us know how we can improve..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground focus:border-destructive focus:ring-0 placeholder:text-muted-foreground/60 min-h-[80px]"
                        />
                      </motion.div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full bg-destructive hover:bg-destructive/90 text-white h-11 transition-all">
                      {loading ? "Unsubscribing..." : "Unsubscribe"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="pt-10 pb-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Unsubscribed
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-3 leading-relaxed">
                    You have been successfully removed from our list. You will no longer receive weekly issues at <strong className="text-foreground">{email}</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 space-y-4 text-center">
                  <div className="bg-accent/40 border border-border rounded-xl p-4 flex gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Unsubscribed by accident?</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">
                        No worries, you can resubscribe instantly by clicking the button below.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      onClick={handleResubscribe} 
                      disabled={loading}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {loading ? "Subscribing..." : "Resubscribe"}
                    </Button>
                    <Link href="/" className="flex-1">
                      <a className="w-full inline-block">
                        <Button variant="outline" className="w-full border-border hover:bg-accent text-muted-foreground hover:text-foreground">
                          Homepage
                        </Button>
                      </a>
                    </Link>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
