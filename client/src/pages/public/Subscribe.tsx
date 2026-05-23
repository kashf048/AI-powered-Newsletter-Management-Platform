import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Mail, User, ShieldCheck, Gift } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SubscribePage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribeMutation = trpc.public.subscribe.useMutation();

  // Simple email validation regex
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await subscribeMutation.mutateAsync({
        email,
        fullName: fullName || undefined,
        referralCode: referralCode || undefined,
      });
      setStep(3);
      toast.success("Subscription initialized successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.3),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 mb-6 group cursor-pointer">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Home
          </a>
        </Link>

        <Card className="bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Accent border on top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pt-8 pb-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
                    Join NexusAI Digest
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-2">
                    Pakistan's leading newsletter on practical AI workflows, news, and developer spotlights.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleNextStep} className="space-y-4">
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
                          className="bg-slate-950 border-slate-800 focus:border-emerald-500 text-white placeholder:text-slate-600 pl-10 h-11"
                        />
                        <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 transition-all duration-200">
                      Continue
                    </Button>
                  </form>

                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-800/60 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>No spam. Unsubscribe at any time.</span>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pt-8 pb-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-white font-sans">
                    Tell us about yourself
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-2">
                    Help us personalize your weekly digest issues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Full Name (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Mansoor Ali"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-slate-950 border-slate-800 focus:border-emerald-500 text-white placeholder:text-slate-600 pl-10 h-11"
                        />
                        <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Referral Code (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="REF12345"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          className="bg-slate-950 border-slate-800 focus:border-emerald-500 text-white placeholder:text-slate-600 pl-10 h-11"
                        />
                        <Gift className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white h-11 transition-all duration-200"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-11 transition-all duration-200"
                        disabled={loading}
                      >
                        {loading ? "Subscribing..." : "Subscribe Now"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="pt-10 pb-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
                    Confirm your subscription!
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-sm mt-3 leading-relaxed">
                    We've sent a verification link to <strong className="text-emerald-400 font-semibold">{email}</strong>.
                    Please check your inbox (and spam folder) to activate your newsletter feed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 text-center space-y-4">
                  <p className="text-xs text-slate-500">
                    Once verified, you will receive a unique referral link to unlock premium guides and templates.
                  </p>
                  <Link href="/">
                    <a className="inline-block w-full">
                      <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all duration-200">
                        Return to Homepage
                      </Button>
                    </a>
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
