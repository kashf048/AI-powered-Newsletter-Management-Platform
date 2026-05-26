import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, ArrowRight, Check, X, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const resetMutation = useMutation({
    mutationFn: apiService.auth.resetPasswordConfirm,
    onSuccess: () => {
      setSuccess(true);
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.detail || "Invalid or expired token. Please request a new password reset.";
      toast.error(errMsg);
    },
  });

  // Password requirements checks
  const passLength = newPassword.length >= 8;
  const passUpper = /[A-Z]/.test(newPassword);
  const passLower = /[a-z]/.test(newPassword);
  const passNumber = /[0-9]/.test(newPassword);
  const passSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const allReqsMet = passLength && passUpper && passLower && passNumber && passSpecial;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is missing. Please request a new link.");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (!allReqsMet) {
      toast.error("Please meet all password strength requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    resetMutation.mutate({
      token,
      newPassword,
    });
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
                Reset Password
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Set a strong, new password for your account
              </p>
            </div>
          </div>

          <hr className="border-slate-800" />

          {!token ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8 text-rose-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">Missing Reset Token</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  A valid password reset token is required. Please check the link in your email or request a new one.
                </p>
              </div>
              <div className="pt-4">
                <Link href="/forgot-password">
                  <a className="inline-flex items-center gap-2 text-xs bg-slate-850 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-lg font-medium transition-all">
                    Request New Link
                  </a>
                </Link>
              </div>
            </div>
          ) : !success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetMutation.isPending}
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
                />
              </div>

              {/* Password Strength Checklist */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 space-y-1 text-xs"
                >
                  <span className="text-slate-400 font-semibold mb-1 block">Password must contain:</span>
                  <div className="flex items-center gap-2">
                    {passLength ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={passLength ? "text-emerald-300" : "text-slate-400"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passUpper ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={passUpper ? "text-emerald-300" : "text-slate-400"}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passLower ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={passLower ? "text-emerald-300" : "text-slate-400"}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={passNumber ? "text-emerald-300" : "text-slate-400"}>One number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passSpecial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={passSpecial ? "text-emerald-300" : "text-slate-400"}>One special character</span>
                  </div>
                </motion.div>
              )}

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={resetMutation.isPending}
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
                />
                {confirmPassword && (
                  <span className={`text-[11px] block mt-1 ${newPassword === confirmPassword ? "text-emerald-400" : "text-rose-400"}`}>
                    {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
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
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">Success!</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  Your password has been reset successfully. Redirecting you to the login portal in a moment...
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col items-center pt-2">
            <Link href="/login">
              <a className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                Back to Sign In
              </a>
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
