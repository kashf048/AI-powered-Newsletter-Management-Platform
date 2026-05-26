import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Frown, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function UnsubscribePage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setStatus("ready");
    } else {
      setStatus("error");
      setErrorMsg(
        "No unsubscribe token found in the link. Please use the unsubscribe link from your email.",
      );
    }
  }, []);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await apiService.public.unsubscribe(token);
      setStatus("success");
      toast.success("You have been unsubscribed.");
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to unsubscribe. The link may be invalid or already used.";
      toast.error(msg);
      setErrorMsg(msg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 group cursor-pointer">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </a>
        </Link>

        <Card className="bg-card border border-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />

          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-16"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </motion.div>
            )}

            {status === "ready" && (
              <motion.div
                key="ready"
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
                    You're about to be removed from the NexusAI Digest mailing list. You won't receive any further emails.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 space-y-4">
                  <Button
                    onClick={handleUnsubscribe}
                    disabled={loading}
                    className="w-full bg-destructive hover:bg-destructive/90 text-white h-11 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Unsubscribing...
                      </>
                    ) : (
                      "Confirm Unsubscribe"
                    )}
                  </Button>
                  <Link href="/">
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      Keep my subscription
                    </Button>
                  </Link>
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
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Unsubscribed
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-3 leading-relaxed">
                    You have been successfully removed from our list. You will no longer receive weekly issues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 space-y-4 text-center">
                  <div className="bg-accent/40 border border-border rounded-xl p-4 flex gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Changed your mind?
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">
                        You can resubscribe anytime at nexusdigest.pk.
                      </p>
                    </div>
                  </div>
                  <Link href="/subscribe">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Resubscribe
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="w-full border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      Go to Homepage
                    </Button>
                  </Link>
                </CardContent>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pt-8 pb-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                    Invalid Link
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-2">
                    {errorMsg || "This unsubscribe link is invalid or has already been used."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="w-full border-border hover:bg-accent"
                    >
                      Go to Homepage
                    </Button>
                  </Link>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
