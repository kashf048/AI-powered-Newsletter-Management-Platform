import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Trash, UserX, UserCheck, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function SubscribersList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: subscribers, isLoading, refetch } = useQuery({
    queryKey: ["subscribers"],
    queryFn: apiService.admin.getSubscribers,
    refetchOnWindowFocus: false,
  });

  const filtered = (subscribers || []).filter((sub) => {
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
    const headers = ["Name", "Email", "Referral Code", "Referrals", "Status", "Date Joined"];
    const rows = filtered.map((sub) => [
      sub.fullName || "Anonymous",
      sub.email,
      sub.referralCode || "",
      sub.referralCount || 0,
      sub.status,
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your newsletter audience, track referrals, and export lists.
          </p>
        </div>
        <Button onClick={handleExportCSV} className="bg-card border border-border hover:bg-accent text-foreground gap-2 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 border border-border rounded-xl">
        <div className="relative w-full md:max-w-xs">
          <Input
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border-border focus:border-primary pl-10 text-foreground"
          />
          <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-3" />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "active", "pending", "unsubscribed"].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? "default" : "outline"}
              className={`h-9 px-4 capitalize transition-all ${
                statusFilter === status 
                  ? "bg-primary text-primary-foreground hover:bg-primary/95" 
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {status}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-muted-foreground hover:text-foreground shrink-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading subscribers...</div>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader className="border-border">
              <TableRow className="border-border hover:bg-accent/40">
                <TableHead className="text-muted-foreground text-xs font-semibold">Subscriber Name</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Email Address</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-24">Referrals</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-28">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-36">Date Joined</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id} className="border-border hover:bg-accent/40">
                  <TableCell className="font-medium text-foreground">
                    {sub.fullName || <span className="text-muted-foreground/60 italic">Anonymous</span>}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {sub.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono font-semibold">
                    {sub.referralCount || 0}
                  </TableCell>
                  <TableCell>
                    {sub.status === "active" && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                        Active
                      </Badge>
                    )}
                    {sub.status === "pending" && (
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/10">
                        Pending
                      </Badge>
                    )}
                    {sub.status === "unsubscribed" && (
                      <Badge className="bg-red-500/10 text-red-500 border border-red-500/10">
                        Unsubscribed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {sub.status === "active" ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleStatusChange(sub.id, sub.status || "")}
                          className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleStatusChange(sub.id, sub.status || "")}
                          className="h-8 w-8 text-muted-foreground hover:text-emerald-500"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(sub.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
          <div className="p-12 text-center text-muted-foreground">
            No subscribers found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
}
