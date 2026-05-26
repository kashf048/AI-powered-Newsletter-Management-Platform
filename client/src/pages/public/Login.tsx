import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: apiService.auth.login,
    onSuccess: (data) => {
      toast.success("Welcome back! Redirecting to dashboard...");
      queryClient.setQueryData(["me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 500);
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.detail || "Invalid credentials. Please try again.";
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      toast.error("Please enter both your email/username and password.");
      return;
    }
    loginMutation.mutate({ emailOrUsername, password });
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
                Admin Portal
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Access the NexusAI Digest management platform
              </p>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername">Email or Username</Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="Enter email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                disabled={loginMutation.isPending}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password">
                  <a className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    Forgot password?
                  </a>
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="flex flex-col items-center space-y-3 pt-2">
            <p className="text-xs text-slate-400">
              Don't have an admin account?{" "}
              <Link href="/register">
                <a className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  Register
                </a>
              </Link>
            </p>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Authorized admin emails only. Access is monitored in compliance with platform security policies.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
