import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </a>
        </Link>
        <h1 className="text-4xl font-bold text-white mb-4">Coming Soon</h1>
        <p className="text-slate-400 mb-8">This page is under development</p>
        <Link href="/">
          <a>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Return Home</Button>
          </a>
        </Link>
      </div>
    </div>
  );
}
