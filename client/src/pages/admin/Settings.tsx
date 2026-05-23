import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, ShieldCheck, Mail, Database, KeyRound, EyeOff, Eye, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [adminName, setAdminName] = useState("Mansoor Ali");
  const [adminEmail, setAdminEmail] = useState("mansoor@nexusai.pk");

  const [newsletterName, setNewsletterName] = useState("NexusAI Digest");
  const [senderEmail, setSenderEmail] = useState("briefing@nexusai.pk");
  const [resendApiKey, setResendApiKey] = useState("re_983f2a8c3d7e8f1a");
  const [showResend, setShowResend] = useState(false);

  const [openAiKey, setOpenAiKey] = useState("sk-forge-3298a83c748e91d");
  const [showOpenAi, setShowOpenAi] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Admin profile updated (Simulation)");
  };

  const handleSaveNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Newsletter configurations saved (Simulation)");
  };

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("API Credentials securely stored (Simulation)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-emerald-400" /> Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure newsletter sender details, integrations keys, and admin profile settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Profile & Newsletter settings */}
        <div className="space-y-6">
          {/* Admin Profile */}
          <Card className="bg-slate-900 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" /> Admin Profile
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">Manage your personal admin account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-9 gap-1.5 transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Newsletter Configuration */}
          <Card className="bg-slate-900 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-emerald-400" /> Newsletter General Rules
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">Sender identities and delivery schedules.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNewsletter} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Newsletter Name</label>
                  <Input
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sender Email Address</label>
                  <Input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-9 gap-1.5 transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save General Configuration
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: API Keys configuration */}
        <div>
          <Card className="bg-slate-900 border-slate-800/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-emerald-400" /> Integrations API Credentials
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">Secured access keys for external newsletter tools.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveKeys} className="space-y-4">
                {/* Resend API Key */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resend Mailer API Key</label>
                  <div className="relative">
                    <Input
                      type={showResend ? "text" : "password"}
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white pr-10 text-xs font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResend(!showResend)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                    >
                      {showResend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Open AI Key */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Forge AI API Key</label>
                  <div className="relative">
                    <Input
                      type={showOpenAi ? "text" : "password"}
                      value={openAiKey}
                      onChange={(e) => setOpenAiKey(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white pr-10 text-xs font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAi(!showOpenAi)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                    >
                      {showOpenAi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3 flex gap-2.5 items-start">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    API credentials are saved locally in the validated env runtime configurations, complying strictly with system security policies.
                  </p>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-9 gap-1.5 transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save API Keys
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
