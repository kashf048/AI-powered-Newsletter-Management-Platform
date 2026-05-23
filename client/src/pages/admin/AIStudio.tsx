import React from 'react';
import { Card } from '@/components/ui/card';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Page</h1>
        <p className="text-slate-400 mt-2">This page is under development</p>
      </div>
      <Card className="bg-slate-800 border-slate-700 p-8 text-center">
        <p className="text-slate-300">Content coming soon...</p>
      </Card>
    </div>
  );
}
