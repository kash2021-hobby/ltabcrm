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

  const today = new Date().toISOString().split('T')[0];

  const totalLeads = leads.length;
  const coldLeads = leads.filter((l) => l.status === "cold").length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  // Follow-up categorization
  const overdueFollowups = leads.filter((l) =>
    l.next_followup_date && l.next_followup_date < today && l.status !== "converted"
  );
  const todayFollowups = leads.filter((l) =>
    l.next_followup_date === today && l.status !== "converted"
  );
  const upcomingFollowups = leads.filter((l) =>
    l.next_followup_date && l.next_followup_date > today && l.status !== "converted"
  );

  // Status distribution for pie chart
  const statusData = [
    { name: "Cold", value: leads.filter((l) => l.status === "cold").length, color: "#3b82f6" },
    { name: "Warm", value: leads.filter((l) => l.status === "warm").length, color: "#eab308" },
    { name: "Hot", value: leads.filter((l) => l.status === "hot").length, color: "#f97316" },
    { name: "Converted", value: leads.filter((l) => l.status === "converted").length, color: "#22c55e" },
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
      title: "Follow-ups Due",
      value: overdueFollowups.length + todayFollowups.length,
      icon: Users,
      description: `${overdueFollowups.length} overdue, ${todayFollowups.length} today`,
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

      {/* Follow-ups Section */}
      {(overdueFollowups.length > 0 || todayFollowups.length > 0 || upcomingFollowups.length > 0) && (
        <Card className="mt-4 sm:mt-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overdue */}
            {overdueFollowups.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2">
                  Overdue ({overdueFollowups.length})
                </h3>
                <div className="space-y-2">
                  {overdueFollowups.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lead.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.followup_note || "No note"}
                        </p>
                      </div>
                      <div className="text-xs text-red-600 font-medium ml-2">
                        {lead.next_followup_date && format(new Date(lead.next_followup_date), "MMM dd")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today */}
            {todayFollowups.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-orange-600 mb-2">
                  Today ({todayFollowups.length})
                </h3>
                <div className="space-y-2">
                  {todayFollowups.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lead.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.followup_note || "No note"}
                        </p>
                      </div>
                      <div className="text-xs text-orange-600 font-medium ml-2">
                        Today
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingFollowups.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-blue-600 mb-2">
                  Upcoming ({upcomingFollowups.length})
                </h3>
                <div className="space-y-2">
                  {upcomingFollowups.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lead.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.followup_note || "No note"}
                        </p>
                      </div>
                      <div className="text-xs text-blue-600 font-medium ml-2">
                        {lead.next_followup_date && format(new Date(lead.next_followup_date), "MMM dd")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}