import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Mail,
  Database,
  KeyRound,
  Save,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: apiService.auth.getMe,
    refetchOnWindowFocus: false,
  });

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    if (user) {
      setAdminName(user.name || "");
      setAdminEmail(user.email || "");
    }
  }, [user]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const profileMutation = useMutation({
    mutationFn: apiService.admin.updateSettings,
    onSuccess: (res) => {
      toast.success(res.message || "Profile updated successfully!");
      // Invalidate user cache so the sidebar reflects updated name
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to update profile.",
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: apiService.auth.changePassword,
    onSuccess: (res) => {
      toast.success(res.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to change password.",
      );
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    profileMutation.mutate({ name: adminName.trim(), email: adminEmail.trim() });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    // Client-side strength check (backend validates too — this is just UX feedback)
    const isStrong =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!isStrong) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.",
      );
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your admin profile and account security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Admin Profile */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Admin Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Manage your personal admin account details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="bg-background border-input text-foreground"
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="bg-background border-input text-foreground"
                    required
                    maxLength={320}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={profileMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {profileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" /> Change Password
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Update your account password. Minimum 8 characters with mixed case, numbers, and symbols.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-background border-input text-foreground"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background border-input text-foreground"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="bg-background border-input text-foreground"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Email & Integration Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Newsletter Configuration
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Email delivery and AI integration settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Resend API (Email Delivery)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Configure via the <code className="bg-muted px-1 py-0.5 rounded text-xs">RESEND_API</code> environment variable in your <code className="bg-muted px-1 py-0.5 rounded text-xs">backend/.env</code> file.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Database className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Groq AI API</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Configure via the <code className="bg-muted px-1 py-0.5 rounded text-xs">GROQ_API_KEY</code> environment variable in your <code className="bg-muted px-1 py-0.5 rounded text-xs">backend/.env</code> file.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Security note:</span>{" "}
                    API keys and credentials are managed exclusively through environment variables
                    on the server. They are never stored in the database or exposed to the browser.
                    See <code className="bg-muted px-1 rounded text-xs">backend/.env.example</code> for the full list of required variables.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
