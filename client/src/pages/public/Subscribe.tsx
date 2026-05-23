import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Mail, User, ShieldCheck, Gift } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SubscribePage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: apiService.public.subscribe
  });

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
      const msg = err.response?.data?.detail || err.message || "Failed to subscribe. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.1),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md z-10 font-sans">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 group cursor-pointer">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Home
          </a>
        </Link>

        <Card className="bg-card border border-border backdrop-blur-md shadow-2xl relative overflow-hidden">
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
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sans">
                    Join NexusAI Digest
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-2">
                    Pakistan's leading newsletter on practical AI workflows, news, and developer spotlights.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleNextStep} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="you@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 pl-10 h-11"
                        />
                        <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 transition-all duration-200">
                      Continue
                    </Button>
                  </form>

                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/60 text-xs text-muted-foreground">
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
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-foreground font-sans">
                    Tell us about yourself
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-2">
                    Help us personalize your weekly digest issues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Full Name (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Mansoor Ali"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 pl-10 h-11"
                        />
                        <User className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Referral Code (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="REF12345"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/60 pl-10 h-11"
                        />
                        <Gift className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-border hover:bg-accent text-muted-foreground hover:text-foreground h-11 transition-all duration-200"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-11 transition-all duration-200"
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
                  <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sans">
                    Confirm your subscription!
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-3 leading-relaxed">
                    We've sent a verification link to <strong className="text-primary font-semibold">{email}</strong>.
                    Please check your inbox (and spam folder) to activate your newsletter feed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 text-center space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Once verified, you will receive a unique referral link to unlock premium guides and templates.
                  </p>
                  <Link href="/">
                    <a className="inline-block w-full">
                      <Button className="w-full bg-accent hover:bg-accent/80 text-foreground transition-all duration-200">
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
