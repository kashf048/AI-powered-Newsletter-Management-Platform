import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Landmark, Plus, BarChart2, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([
    { id: 1, company: "Bazaar Technologies", campaign: "AI Engineers Hiring Drive", placement: "Top Banner", issueNumber: 18, price: 150, status: "paid", clicks: 142, impressions: 3200 },
    { id: 2, company: "Systems Limited", campaign: "Cloud Native Summit Sponsorship", placement: "Middle Section", issueNumber: 17, price: 120, status: "paid", clicks: 98, impressions: 3150 },
    { id: 3, company: "Sadapay", campaign: "SadaBiz Freelancer Account Launch", placement: "Bottom Pick", issueNumber: 19, price: 100, status: "pending", clicks: 0, impressions: 0 },
  ]);

  const [company, setCompany] = useState("");
  const [campaign, setCampaign] = useState("");
  const [placement, setPlacement] = useState("Top Banner");
  const [issueNumber, setIssueNumber] = useState(19);
  const [price, setPrice] = useState(100);

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !campaign) {
      toast.error("Please fill in company and campaign details");
      return;
    }

    const newSponsor = {
      id: Date.now(),
      company,
      campaign,
      placement,
      issueNumber: Number(issueNumber),
      price: Number(price),
      status: "pending",
      clicks: 0,
      impressions: 0,
    };

    setSponsors([newSponsor, ...sponsors]);
    toast.success("Sponsor slot booked successfully!");
    setCompany("");
    setCampaign("");
  };

  const handleMarkAsPaid = (id: number) => {
    setSponsors(
      sponsors.map((s) => (s.id === id ? { ...s, status: "paid" } : s))
    );
    toast.success("Sponsorship marked as paid!");
  };

  const totalRevenue = sponsors.reduce((acc, curr) => acc + curr.price, 0);
  const paidRevenue = sponsors
    .filter((s) => s.status === "paid")
    .reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Sponsorships</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage bookings, track slots placement, and monitor CTR metrics.
        </p>
      </div>

      {/* Revenue Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalRevenue} USD</div>
            <p className="text-xs text-slate-400 mt-1">Cumulative bookings lifetime</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Revenue</span>
            <Landmark className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${paidRevenue} USD</div>
            <p className="text-xs text-slate-400 mt-1">Funds successfully cleared</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Revenue</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalRevenue - paidRevenue} USD</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Bookings Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Sponsorship Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-slate-800/10">
                    <TableHead className="text-slate-400 text-xs">Sponsor</TableHead>
                    <TableHead className="text-slate-400 text-xs w-20">Issue #</TableHead>
                    <TableHead className="text-slate-400 text-xs w-28">Placement</TableHead>
                    <TableHead className="text-slate-400 text-xs w-24">Price</TableHead>
                    <TableHead className="text-slate-400 text-xs w-24">Clicks / CTR</TableHead>
                    <TableHead className="text-slate-400 text-xs w-24">Status</TableHead>
                    <TableHead className="text-slate-400 text-xs w-16 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.map((s) => (
                    <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/20">
                      <TableCell className="py-3.5">
                        <div className="text-xs font-bold text-white">{s.company}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{s.campaign}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-350">
                        #{s.issueNumber}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {s.placement}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-200">
                        ${s.price}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {s.clicks > 0 ? (
                          <span>
                            {s.clicks}{" "}
                            <span className="text-[10px] text-slate-500">
                              ({((s.clicks / s.impressions) * 100).toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">No activity</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.status === "paid" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[10px] px-2 py-0.5">
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/10 text-[10px] px-2 py-0.5">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.status === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMarkAsPaid(s.id)}
                            className="h-8 w-8 text-emerald-400 hover:text-emerald-300"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: New Sponsor Booking Form */}
        <div>
          <Card className="bg-slate-900 border-slate-800/80 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" /> Book Slot
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Schedule a new sponsorship campaign slot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSponsor} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</label>
                  <Input
                    placeholder="e.g. Systems Limited"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campaign Name</label>
                  <Input
                    placeholder="e.g. AI Engineer Career Drive"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue #</label>
                    <Input
                      type="number"
                      value={issueNumber}
                      onChange={(e) => setIssueNumber(parseInt(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price (USD)</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slot Placement</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Top Banner">Top Banner (Premium)</option>
                    <option value="Middle Section">Middle Section</option>
                    <option value="Bottom Pick">Bottom Pick</option>
                  </select>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-colors font-bold">
                  Schedule Booking
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
