import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadForm } from "@/components/leads/LeadForm";
import { useLeads } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UserPlus, User } from "lucide-react";
import { useState } from "react";

export default function Leads() {
  const { leads, isLoading, updateLead, deleteLead, createLead } = useLeads();
  const { users } = useUsers();
  const isMobile = useIsMobile();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const salesmen = users.filter((u) => u.role === "salesman" || u.role === "admin");
  const unassignedLeads = leads.filter((l) => !l.assigned_to);

  const handleAssign = (leadId: number, userId: string) => {
    updateLead.mutate({ id: leadId, updates: { assigned_to: userId } });
  };

  // Create Lead Form Trigger & Content
  const CreateLeadTrigger = (
    <Button className={isMobile ? "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg" : ""}>
      <Plus className={isMobile ? "h-6 w-6" : "mr-2 h-4 w-4"} />
      {!isMobile && "Add Lead"}
    </Button>
  );

  const CreateLeadContent = (
    <LeadForm
      onSubmit={(data) => {
        createLead.mutate(data);
        setIsCreateDialogOpen(false);
      }}
    />
  );

  // Quick Assign Card Component
  const QuickAssignCard = ({ lead }: { lead: typeof leads[0] }) => (
    <Card className="min-w-[260px] flex-shrink-0 md:min-w-0 md:flex-shrink">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{lead.full_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground truncate">{lead.bike_model || "No model"}</p>
            </div>
          </div>
          <Select onValueChange={(value) => handleAssign(lead.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Assign to salesman" />
            </SelectTrigger>
            <SelectContent>
              {salesmen.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {user.full_name || user.email}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="All Leads">
      <div className="space-y-3 sm:space-y-6 pb-20 sm:pb-0">
        {/* Header - Desktop only description */}
        <div className="flex items-center justify-between">
          <p className="hidden md:block text-muted-foreground">
            Manage all leads and assign them to salesmen
          </p>
          
          {/* Desktop Add Lead Button */}
          {!isMobile && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                {CreateLeadTrigger}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Lead</DialogTitle>
                </DialogHeader>
                {CreateLeadContent}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Quick Assign Section */}
        {salesmen.length > 0 && unassignedLeads.length > 0 && (
          <Card>
            <CardHeader className="pb-3 px-4 md:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Quick Assign
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {unassignedLeads.length} unassigned
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4">
              {/* Mobile: Horizontal scroll, Desktop: Grid */}
              <div className={
                isMobile 
                  ? "flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
                  : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              }>
                {unassignedLeads.slice(0, isMobile ? 5 : 3).map((lead) => (
                  <div key={lead.id} className={isMobile ? "snap-start" : ""}>
                    <QuickAssignCard lead={lead} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads Table/Cards */}
        <LeadsTable
          leads={leads}
          onUpdate={(id, updates) => updateLead.mutate({ id, updates })}
          onDelete={(id) => deleteLead.mutate(id)}
          isLoading={isLoading}
        />

        {/* Mobile FAB - Add Lead Drawer */}
        {isMobile && (
          <Drawer open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DrawerTrigger asChild>
              {CreateLeadTrigger}
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Create New Lead</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-8">
                {CreateLeadContent}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </DashboardLayout>
  );
}
