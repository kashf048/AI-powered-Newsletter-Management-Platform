import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Frown, CheckCircle, Mail, AlertTriangle } from "lucide-react";
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
    // Simulate API request to unsubscribe
    setTimeout(() => {
      setLoading(false);
      setStatus("success");
      toast.success("You have been unsubscribed.");
    }, 1200);
  };

  const handleResubscribe = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus("form");
      toast.success("Welcome back! You have resubscribed.");
    }, 1000);
  };

  const reasons = [
    { value: "too_frequent", label: "Emails are too frequent" },
    { value: "irrelevant", label: "Content is no longer relevant to me" },
    { value: "no_time", label: "I don't have time to read it" },
    { value: "other", label: "Other (please specify below)" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.2),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 mb-6 group cursor-pointer">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Home
          </a>
        </Link>

        <Card className="bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

          <AnimatePresence mode="wait">
            {status === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pt-8 pb-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <Frown className="w-6 h-6 text-red-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    Unsubscribe
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-2">
                    We're sorry to see you go. Let us know how we can improve.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleUnsubscribe} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Email Address
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="you@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-950 border-slate-800 focus:border-red-500 text-white placeholder:text-slate-600 pl-10 h-11"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Reason for unsubscribing
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {reasons.map((r) => (
                          <label
                            key={r.value}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer text-sm ${
                              reason === r.value
                                ? "bg-red-500/5 border-red-500/30 text-white"
                                : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value={r.value}
                              checked={reason === r.value}
                              onChange={() => setReason(r.value)}
                              className="accent-red-500"
                            />
                            {r.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Additional Feedback (Optional)
                      </label>
                      <textarea
                        placeholder="What could we have done better?"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg focus:border-red-500 focus:outline-none p-3 text-sm text-white placeholder:text-slate-600 min-h-[80px] resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-500 text-white h-11 transition-all duration-200 font-medium"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Unsubscribe"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="pt-10 pb-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white">
                    Unsubscribed
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-3 leading-relaxed">
                    You have been successfully removed from <strong className="text-white">NexusAI Digest</strong> list. 
                    No further emails will be sent to <span className="text-slate-300 font-semibold">{email}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 space-y-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Unsubscribed by mistake? You can re-subscribe instantly below without re-entering your details.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleResubscribe}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-11 transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? "Subscribing..." : "Resubscribe"}
                    </Button>
                    <Link href="/" className="flex-1">
                      <a className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white h-11"
                        >
                          Return Home
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
