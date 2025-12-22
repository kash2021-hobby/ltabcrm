import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTeamPerformance, SalesmanStats } from "@/hooks/useTeamPerformance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Target, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function getPerformanceBadge(rate: number) {
  if (rate >= 40) return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Excellent</Badge>;
  if (rate >= 25) return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Good</Badge>;
  if (rate >= 10) return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Average</Badge>;
  return <Badge className="bg-muted text-muted-foreground">New</Badge>;
}

export default function TeamPerformance() {
  const { data: teamStats, isLoading } = useTeamPerformance();

  const totalSalesmen = teamStats?.length || 0;
  const totalLeadsAssigned = teamStats?.reduce((sum, s) => sum + s.totalLeads, 0) || 0;
  const totalConverted = teamStats?.reduce((sum, s) => sum + s.convertedLeads, 0) || 0;
  const avgConversionRate = totalLeadsAssigned > 0 
    ? ((totalConverted / totalLeadsAssigned) * 100).toFixed(1) 
    : "0";
  const topPerformer = teamStats?.length 
    ? teamStats.reduce((prev, curr) => curr.conversionRate > prev.conversionRate ? curr : prev)
    : null;

  const summaryStats = [
    {
      title: "Total Salesmen",
      value: totalSalesmen,
      icon: Users,
      description: "Active team members",
    },
    {
      title: "Total Leads Assigned",
      value: totalLeadsAssigned,
      icon: Target,
      description: "Across all salesmen",
    },
    {
      title: "Total Converted",
      value: totalConverted,
      icon: TrendingUp,
      description: "Successful conversions",
    },
    {
      title: "Top Performer",
      value: topPerformer?.fullName || topPerformer?.email?.split("@")[0] || "-",
      icon: Award,
      description: topPerformer ? `${topPerformer.conversionRate.toFixed(1)}% rate` : "No data",
    },
  ];

  return (
    <DashboardLayout title="Team Performance">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Stats Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Per-Salesman Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : teamStats && teamStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salesman</TableHead>
                  <TableHead className="text-center">Total Leads</TableHead>
                  <TableHead className="text-center">New</TableHead>
                  <TableHead className="text-center">Contacted</TableHead>
                  <TableHead className="text-center">Qualified</TableHead>
                  <TableHead className="text-center">Converted</TableHead>
                  <TableHead className="text-center">Lost</TableHead>
                  <TableHead className="text-center">Rate</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamStats.map((stats) => (
                  <TableRow key={stats.userId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {stats.fullName || stats.email.split("@")[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stats.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {stats.totalLeads}
                    </TableCell>
                    <TableCell className="text-center text-blue-600">
                      {stats.newLeads}
                    </TableCell>
                    <TableCell className="text-center text-yellow-600">
                      {stats.contactedLeads}
                    </TableCell>
                    <TableCell className="text-center text-purple-600">
                      {stats.qualifiedLeads}
                    </TableCell>
                    <TableCell className="text-center text-green-600 font-medium">
                      {stats.convertedLeads}
                    </TableCell>
                    <TableCell className="text-center text-red-600">
                      {stats.lostLeads}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {stats.conversionRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceBadge(stats.conversionRate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No salesmen found. Add salesmen from the Users page.
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
