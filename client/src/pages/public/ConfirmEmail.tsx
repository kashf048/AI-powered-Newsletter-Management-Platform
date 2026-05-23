import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Sparkles, Copy, Check, Gift } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ConfirmEmailPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [referralCode, setReferralCode] = useState("NX" + Math.floor(100000 + Math.random() * 900000));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await apiService.public.confirm(token);
        if (res.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    verifyToken();
  }, []);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/referral/${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.1),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Card className="bg-card border border-border backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

          {status === "loading" && (
            <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">Verifying subscription token...</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Just a moment while we update our database.</p>
            </CardContent>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="pt-10 pb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
                  You're Subscribed!
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  Thank you for confirming your subscription to <strong className="text-primary font-semibold">NexusAI Digest</strong>.
                  Welcome to Pakistan's fastest growing AI community.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                {/* Referral program card */}
                <div className="bg-accent/40 border border-border rounded-xl p-5 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Unlock Free Perks</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Share your unique referral link with other creators. When they subscribe, you unlock prompt packs, agentic workflow blueprints, and premium access!
                  </p>
                  
                  <div className="flex gap-2">
                    <div className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono select-all flex-1 flex items-center truncate">
                      {window.location.origin}/referral/{referralCode}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleCopyLink} 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 h-9"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Link href="/">
                  <a className="inline-block w-full">
                    <Button className="w-full bg-accent hover:bg-accent/80 text-foreground transition-all duration-200">
                      Go to Homepage
                    </Button>
                  </a>
                </Link>
              </CardContent>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="pt-10 pb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  This confirmation link is invalid, expired, or has already been used to confirm subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8 text-center space-y-4">
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  If you think this is an error, please try subscribing again or contact support at support@nexusdigest.pk
                </p>
                <div className="flex gap-3">
                  <Link href="/subscribe" className="flex-1">
                    <a className="w-full inline-block">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Try Subscribing
                      </Button>
                    </a>
                  </Link>
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
        </Card>
      </div>
    </div>
  );
}
