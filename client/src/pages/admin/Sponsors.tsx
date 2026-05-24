import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Landmark, Plus, PlusCircle, Trash, RefreshCw, Globe, Mail, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Sponsors() {
  const { data: sponsors, isLoading, refetch } = useQuery({
    queryKey: ["sponsors"],
    queryFn: apiService.admin.getSponsors,
    refetchOnWindowFocus: false,
  });

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [status, setStatus] = useState("prospect");
  const [notes, setNotes] = useState("");

  const createMutation = useMutation({
    mutationFn: apiService.admin.createSponsor,
    onSuccess: () => {
      toast.success("Sponsor created successfully!");
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setWebsiteUrl("");
      setStatus("prospect");
      setNotes("");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "Failed to create sponsor");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: apiService.admin.deleteSponsor,
    onSuccess: () => {
      toast.success("Sponsor deleted successfully");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "Failed to delete sponsor");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => apiService.admin.updateSponsor(id, payload),
    onSuccess: () => {
      toast.success("Sponsor updated successfully");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || "Failed to update sponsor");
    }
  });

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactEmail) {
      toast.error("Please fill in company name and contact email");
      return;
    }

    createMutation.mutate({
      companyName,
      contactName,
      contactEmail,
      websiteUrl,
      status,
      notes,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    updateStatusMutation.mutate({ id, payload: { status: nextStatus } });
  };

  // Simple statistics
  const totalSponsors = sponsors?.length || 0;
  const activeSponsors = sponsors?.filter(s => s.status === "active").length || 0;
  const totalSpend = sponsors?.reduce((acc, curr) => acc + (curr.totalSpendPkr || 0), 0) || 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Sponsors</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your advertisers, sponsorships growth, and billing status.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sponsors</span>
            <User className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSponsors}</div>
            <p className="text-xs text-slate-400 mt-1">Total database profile count</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Campaigns</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeSponsors}</div>
            <p className="text-xs text-slate-400 mt-1">Sponsors currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rs. {totalSpend.toLocaleString()} PKR</div>
            <p className="text-xs text-slate-400 mt-1">Total revenue generated from sponsors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Sponsors Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">All Sponsors</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">Loading sponsors...</div>
              ) : sponsors && sponsors.length > 0 ? (
                <Table>
                  <TableHeader className="border-slate-800">
                    <TableRow className="border-slate-800 hover:bg-slate-800/10">
                      <TableHead className="text-slate-400 text-xs">Company</TableHead>
                      <TableHead className="text-slate-400 text-xs">Contact</TableHead>
                      <TableHead className="text-slate-400 text-xs">Status</TableHead>
                      <TableHead className="text-slate-400 text-xs">Total Spend</TableHead>
                      <TableHead className="text-slate-400 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsors.map((s) => (
                      <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/20">
                        <TableCell className="py-3.5">
                          <div className="text-xs font-bold text-white">{s.companyName}</div>
                          {s.websiteUrl && (
                            <a 
                              href={s.websiteUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] text-emerald-400 flex items-center gap-1 hover:underline mt-0.5"
                            >
                              <Globe className="w-2.5 h-2.5" /> Website
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-200">{s.contactName || "N/A"}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" /> {s.contactEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            className={`cursor-pointer text-[10px] px-2 py-0.5 border ${
                              s.status === "active" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                                : s.status === "paused"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/10"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/10"
                            }`}
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-200">
                          Rs. {(s.totalSpendPkr || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(s.id)}
                            className="h-8 w-8 text-slate-400 hover:text-red-400"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-slate-500">No sponsors found. Add one on the right!</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: New Sponsor Form */}
        <div>
          <Card className="bg-slate-900 border-slate-800/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" /> Add Sponsor
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Create a new advertiser profile in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSponsor} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</label>
                  <Input
                    placeholder="e.g. Systems Limited"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Name</label>
                  <Input
                    placeholder="e.g. Ali Ahmed"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. ads@systemsltd.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Website URL</label>
                  <Input
                    type="url"
                    placeholder="e.g. https://www.systemsltd.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Internal Notes</label>
                  <textarea
                    placeholder="e.g. Booked for issue #18 Roundup slot"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-20 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-colors font-bold"
                >
                  {createMutation.isPending ? "Adding..." : "Add Sponsor Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
