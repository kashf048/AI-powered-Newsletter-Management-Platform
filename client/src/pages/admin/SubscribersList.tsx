import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Trash, UserX, UserCheck, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function SubscribersList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: dbSubscribers, isLoading, refetch } = trpc.admin.getSubscribers.useQuery(undefined, {
    refetchOnWindowFocus: false,
  } as any);

  const mockSubscribers = [
    { id: 1, fullName: "Amina Khan", email: "amina@domain.pk", referralCode: "AM8932", referralCount: 4, status: "active", source: "website", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 2, fullName: "Zainab Malik", email: "zainab@domain.pk", referralCode: "ZM4423", referralCount: 1, status: "active", source: "website", createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: 3, fullName: "Bilal Ahmed", email: "bilal@domain.pk", referralCode: "BA7781", referralCount: 0, status: "pending", source: "referral", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 4, fullName: "Hamza Abbasi", email: "hamza@domain.pk", referralCode: "HA0023", referralCount: 12, status: "active", source: "website", createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
    { id: 5, fullName: "Sara Ali", email: "sara@domain.pk", referralCode: "SA1124", referralCount: 0, status: "unsubscribed", source: "website", createdAt: new Date(Date.now() - 3600000 * 96).toISOString() },
  ];

  const subscribers = (dbSubscribers && dbSubscribers.length > 0) ? dbSubscribers : mockSubscribers;

  const filtered = subscribers.filter((sub) => {
    const matchesSearch =
      (sub.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "pending" : "active";
    toast.success(`Subscriber status changed to ${nextStatus} (Simulation)`);
  };

  const handleDelete = (id: number) => {
    toast.success(`Removed subscriber #${id} (Simulation)`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Referral Code", "Referrals", "Status", "Source", "Date Joined"];
    const rows = filtered.map((sub) => [
      sub.fullName || "Anonymous",
      sub.email,
      sub.referralCode || "",
      sub.referralCount || 0,
      sub.status,
      sub.source,
      new Date(sub.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscribers list exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Subscribers</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your newsletter audience, track referrals, and export lists.
          </p>
        </div>
        <Button onClick={handleExportCSV} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Input
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border-slate-800 focus:border-emerald-500 pl-10 text-white"
          />
          <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "active", "pending", "unsubscribed"].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? "default" : "outline"}
              className={`h-9 px-4 capitalize transition-all ${
                statusFilter === status 
                  ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700" 
                  : "border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {status}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-slate-400 hover:text-white shrink-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-slate-900/60 border border-slate-900 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading subscribers...</div>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-slate-800/10">
                <TableHead className="text-slate-400 text-xs font-semibold">Subscriber Name</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Email Address</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-24">Referrals</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-28">Status</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-28">Source</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-36">Date Joined</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id} className="border-slate-800 hover:bg-slate-800/20">
                  <TableCell className="font-medium text-white">
                    {sub.fullName || <span className="text-slate-500 italic">Anonymous</span>}
                  </TableCell>
                  <TableCell className="font-mono text-slate-300">
                    {sub.email}
                  </TableCell>
                  <TableCell className="text-slate-300 font-mono font-semibold">
                    {sub.referralCount || 0}
                  </TableCell>
                  <TableCell>
                    {sub.status === "active" && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                        Active
                      </Badge>
                    )}
                    {sub.status === "pending" && (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/10">
                        Pending
                      </Badge>
                    )}
                    {sub.status === "unsubscribed" && (
                      <Badge className="bg-red-500/10 text-red-400 border border-red-500/10">
                        Unsubscribed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs capitalize">
                    {sub.source}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {sub.status === "active" ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleStatusChange(sub.id, sub.status || "")}
                          className="h-8 w-8 text-slate-400 hover:text-amber-400"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleStatusChange(sub.id, sub.status || "")}
                          className="h-8 w-8 text-slate-400 hover:text-emerald-400"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(sub.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No subscribers found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
}
