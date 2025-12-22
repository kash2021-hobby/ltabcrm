import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadForm } from "@/components/leads/LeadForm";
import { useLeads } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Leads() {
  const { leads, isLoading, updateLead, deleteLead, createLead } = useLeads();
  const { users } = useUsers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const salesmen = users.filter((u) => u.role === "salesman" || u.role === "admin");

  const handleAssign = (leadId: number, userId: string) => {
    updateLead.mutate({ id: leadId, updates: { assigned_to: userId } });
  };

  return (
    <DashboardLayout title="All Leads">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage all leads and assign them to salesmen
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <LeadForm
                onSubmit={(data) => {
                  createLead.mutate(data);
                  setIsCreateDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Assign Leads Section */}
        {salesmen.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-4 font-medium">Quick Assign</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {leads
                .filter((l) => !l.assigned_to)
                .slice(0, 3)
                .map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between gap-2 rounded border p-3">
                    <div>
                      <p className="font-medium">{lead.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{lead.bike_model}</p>
                    </div>
                    <Select onValueChange={(value) => handleAssign(lead.id, value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Assign to" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesmen.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Leads Table */}
        <LeadsTable
          leads={leads}
          onUpdate={(id, updates) => updateLead.mutate({ id, updates })}
          onDelete={(id) => deleteLead.mutate(id)}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
