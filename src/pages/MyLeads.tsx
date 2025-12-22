import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { useLeads } from "@/hooks/useLeads";

export default function MyLeads() {
  const { leads, isLoading, updateLead } = useLeads();

  return (
    <DashboardLayout title="My Leads">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          View and manage your assigned leads
        </p>

        <LeadsTable
          leads={leads}
          onUpdate={(id, updates) => updateLead.mutate({ id, updates })}
          onDelete={() => {}} // Salesmen can't delete
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
