import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLeads } from "@/hooks/useLeads";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { role } = useAuth();
  const { leads } = useLeads();

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  // Status distribution for pie chart
  const statusData = [
    { name: "New", value: leads.filter((l) => l.status === "new").length, color: "#3b82f6" },
    { name: "Contacted", value: leads.filter((l) => l.status === "contacted").length, color: "#eab308" },
    { name: "Qualified", value: leads.filter((l) => l.status === "qualified").length, color: "#8b5cf6" },
    { name: "Converted", value: leads.filter((l) => l.status === "converted").length, color: "#22c55e" },
    { name: "Lost", value: leads.filter((l) => l.status === "lost").length, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Bike model distribution for bar chart
  const bikeModelCounts = leads.reduce((acc, lead) => {
    const model = lead.bike_model || "Unknown";
    acc[model] = (acc[model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bikeData = Object.entries(bikeModelCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: FileText,
      description: role === "salesman" ? "Your assigned leads" : "All leads",
    },
    {
      title: "New Leads",
      value: newLeads,
      icon: Users,
      description: "Awaiting contact",
    },
    {
      title: "Converted",
      value: convertedLeads,
      icon: CheckCircle,
      description: "Successful conversions",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      description: "Overall performance",
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Bike Models */}
        <Card>
          <CardHeader>
            <CardTitle>Top Bike Models</CardTitle>
          </CardHeader>
          <CardContent>
            {bikeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bikeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
