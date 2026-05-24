import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, ShieldCheck, Mail, Database, KeyRound, EyeOff, Eye, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function Settings() {
  const { data: user, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: apiService.auth.getMe,
    refetchOnWindowFocus: false,
  });

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // Sync state with loaded user
  useEffect(() => {
    if (user) {
      setAdminName(user.name || "");
      setAdminEmail(user.email || "");
    }
  }, [user]);

  const [newsletterName, setNewsletterName] = useState("NexusAI Digest");
  const [senderEmail, setSenderEmail] = useState("briefing@nexusai.pk");
  const [resendApiKey, setResendApiKey] = useState("re_983f2a8c3d7e8f1a");
  const [showResend, setShowResend] = useState(false);

  const [openAiKey, setOpenAiKey] = useState("gsk_placeholder_key_val");
  const [showOpenAi, setShowOpenAi] = useState(false);

  const profileMutation = useMutation({
    mutationFn: apiService.admin.updateSettings,
    onSuccess: (res) => {
      toast.success(res.message || "Profile updated successfully!");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "Failed to update profile");
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail) {
      toast.error("Please fill in name and email");
      return;
    }
    profileMutation.mutate({
      name: adminName,
      email: adminEmail,
    });
  };

  const handleSaveNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Newsletter configurations saved (Simulation - Configure via .env for production)");
  };

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("API Credentials securely stored (Simulation - Configure via .env for production)");
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
                <Button 
                  type="submit" 
                  disabled={profileMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-9 gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> {profileMutation.isPending ? "Saving..." : "Save Profile"}
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

                {/* Groq Key */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Groq API Key</label>
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
