import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, ArrowRight, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const registerMutation = useMutation({
    mutationFn: apiService.auth.register,
    onSuccess: (data) => {
      toast.success("Account registered successfully!");
      queryClient.setQueryData(["me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 500);
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(errMsg);
    },
  });

  // Password requirements checks
  const passLength = password.length >= 8;
  const passUpper = /[A-Z]/.test(password);
  const passLower = /[a-z]/.test(password);
  const passNumber = /[0-9]/.test(password);
  const passSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const allReqsMet = passLength && passUpper && passLower && passNumber && passSpecial;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast.error("Username can only contain alphanumeric characters, underscores, and hyphens.");
      return;
    }
    if (!allReqsMet) {
      toast.error("Please ensure your password meets all strength requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    registerMutation.mutate({
      username,
      email,
      name: name || undefined,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden font-sans py-12">
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
                Create Admin Account
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Register as an admin for the NexusAI Digest platform
              </p>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin_user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={registerMutation.isPending}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@nexusdigest.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={registerMutation.isPending}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={registerMutation.isPending}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={registerMutation.isPending}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
              />
            </div>

            {/* Password Strength Checklist */}
            {password && (
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
                disabled={registerMutation.isPending}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-emerald-500"
              />
              {confirmPassword && (
                <span className={`text-[11px] block mt-1 ${password === confirmPassword ? "text-emerald-400" : "text-rose-400"}`}>
                  {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center space-y-3 pt-2">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  Sign In
                </a>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
