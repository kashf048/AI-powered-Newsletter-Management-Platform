import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Sparkles, Copy, Check, Gift } from "lucide-react";
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

    // Simulate database update
    const timer = setTimeout(() => {
      if (token === "invalid" || token === "") {
        setStatus("error");
      } else {
        setStatus("success");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/referral/${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.2),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Card className="bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

          {status === "loading" && (
            <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
              <p className="text-slate-300 font-medium">Verifying subscription token...</p>
              <p className="text-xs text-slate-500 mt-2">Just a moment while we update our database.</p>
            </CardContent>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="pt-10 pb-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 relative">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-emerald-400"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                  Subscription Verified! <Sparkles className="w-5 h-5 text-amber-400" />
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm mt-2">
                  Welcome to NexusAI Digest. You're now on the weekly briefing list!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                {/* Referral section */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <Gift className="w-4 h-4" />
                    <span>Refer Friends & Unlock Rewards</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Share your unique link. When 3 friends join, you unlock the <strong className="text-white">Premium Prompt Pack</strong>!
                  </p>
                  
                  <div className="flex gap-2">
                    <div className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-300 flex-1 truncate select-all flex items-center">
                      {window.location.origin}/referral/{referralCode}
                    </div>
                    <Button 
                      onClick={handleCopyLink}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white size-9 p-0 flex items-center justify-center shrink-0 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href="/">
                    <a className="w-full">
                      <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all duration-200">
                        Explore Latest Issues
                      </Button>
                    </a>
                  </Link>
                </div>
              </CardContent>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="pt-10 pb-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm mt-2">
                  The verification link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-8 text-center">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Confirmation tokens expire after 24 hours. Please request a new verification email by entering your address on the subscribe page.
                </p>
                <div className="flex gap-3">
                  <Link href="/subscribe" className="flex-1">
                    <a className="w-full">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                        Try Again
                      </Button>
                    </a>
                  </Link>
                  <Link href="/" className="flex-1">
                    <a className="w-full">
                      <Button variant="outline" className="w-full border-slate-800 hover:bg-slate-800 text-slate-300">
                        Go Home
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
