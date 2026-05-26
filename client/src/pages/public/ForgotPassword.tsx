import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, ArrowRight, MailCheck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resetMutation = useMutation({
    mutationFn: apiService.auth.forgotPassword,
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Reset request sent!");
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.detail || "Something went wrong. Please try again.";
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    resetMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur-md bg-opacity-80">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                Forgot Password
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Request a secure password reset link
              </p>
            </div>
          </div>

          <hr className="border-slate-800" />

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@nexusdigest.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={resetMutation.isPending}
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
                />
              </div>

              <Button
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto">
                <MailCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">Check Your Email</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  If the email <strong className="text-slate-300">{email}</strong> is registered, we have sent a password reset link to it. The link will expire in 1 hour.
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col items-center pt-2">
            <Link href="/login">
              <a className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </a>
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
