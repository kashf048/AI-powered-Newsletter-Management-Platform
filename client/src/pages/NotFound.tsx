import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />

      <Card className="w-full max-w-md mx-4 bg-slate-900/80 border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-amber-500" />
        <CardContent className="pt-10 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center relative">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">404</h1>
            <h2 className="text-lg font-bold text-slate-350">Page Not Found</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
              The page you are looking for doesn't exist, has been removed, or the link has expired.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors">
                <Home className="w-4 h-4 mr-2" /> Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
