import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLeads } from "@/hooks/useLeads";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Legend,
} from "recharts";

export default function Dashboard() {
  const { role } = useAuth();
  const { leads } = useLeads();
  const isMobile = useIsMobile();

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
    .map(([name, value]) => ({ name: isMobile ? name.split(" ")[0] : name, value }))
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

  // Chart dimensions based on mobile
  const chartHeight = isMobile ? 220 : 300;
  const pieInnerRadius = isMobile ? 40 : 60;
  const pieOuterRadius = isMobile ? 70 : 100;

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={pieInnerRadius}
                    outerRadius={pieOuterRadius}
                    paddingAngle={5}
                    dataKey="value"
                    label={isMobile ? undefined : ({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {isMobile && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground" style={{ height: chartHeight }}>
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Bike Models */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Top Bike Models</CardTitle>
          </CardHeader>
          <CardContent>
            {bikeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={bikeData} layout={isMobile ? "vertical" : "horizontal"}>
                  <CartesianGrid strokeDasharray="3 3" />
                  {isMobile ? (
                    <>
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                    </>
                  ) : (
                    <>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                    </>
                  )}
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground" style={{ height: chartHeight }}>
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}