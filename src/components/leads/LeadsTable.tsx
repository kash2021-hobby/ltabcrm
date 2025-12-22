import { useState } from "react";
import { Lead } from "@/hooks/useLeads";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Edit, Trash2, Eye, Phone, Bike, Calendar } from "lucide-react";
import { LeadForm } from "./LeadForm";
import { format } from "date-fns";

interface LeadsTableProps {
  leads: Lead[];
  onUpdate: (id: number, updates: Partial<Lead>) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  converted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function LeadsTable({ leads, onUpdate, onDelete, isLoading }: LeadsTableProps) {
  const { role } = useAuth();
  const isMobile = useIsMobile();
  const isAdmin = role === "admin";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone_number?.includes(search) ||
      lead.bike_model?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading leads...</div>
      </div>
    );
  }

  // View Lead Content - shared between Dialog and Drawer
  const ViewLeadContent = ({ lead }: { lead: Lead }) => (
    <div className="space-y-4 p-4 md:p-0">
      <div>
        <p className="text-sm text-muted-foreground">Name</p>
        <p className="font-medium">{lead.full_name || "-"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Phone</p>
        <p className="font-medium">{lead.phone_number || "-"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Bike Model</p>
        <p className="font-medium">{lead.bike_model || "-"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Post Code</p>
        <p className="font-medium">{lead.post_code || "-"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Purchase Timeline</p>
        <p className="font-medium">{lead.purchase_timeline || "-"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Notes</p>
        <p className="font-medium">{lead.notes || "No notes"}</p>
      </div>
    </div>
  );

  // Lead Actions Component
  const LeadActions = ({ lead }: { lead: Lead }) => {
    if (isMobile) {
      return (
        <div className="flex items-center gap-2">
          {/* View Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Eye className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Lead Details</DrawerTitle>
              </DrawerHeader>
              <ViewLeadContent lead={lead} />
            </DrawerContent>
          </Drawer>

          {/* Edit Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Edit className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Edit Lead</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <LeadForm
                  lead={lead}
                  onSubmit={(updates) => {
                    onUpdate(lead.id, updates);
                  }}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Delete Button */}
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(lead.id)}
              className="text-destructive hover:text-destructive h-9 w-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-2">
        {/* View Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            <ViewLeadContent lead={lead} />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <LeadForm
              lead={lead}
              onSubmit={(updates) => {
                onUpdate(lead.id, updates);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Button (Admin only) */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lead.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // Mobile Card View - Optimized
  const MobileCardView = () => (
    <div className="space-y-2">
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            No leads found
          </CardContent>
        </Card>
      ) : (
        filteredLeads.map((lead) => (
          <Card key={lead.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch">
                {/* Status indicator bar */}
                <div className={`w-1.5 ${
                  lead.status === 'converted' ? 'bg-green-500' :
                  lead.status === 'contacted' ? 'bg-yellow-500' :
                  lead.status === 'qualified' ? 'bg-purple-500' :
                  lead.status === 'lost' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Name and Status Row */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate text-sm">
                          {lead.full_name || "Unknown"}
                        </h3>
                        <Badge className={`${statusColors[lead.status || "new"]} text-xs px-1.5 py-0`}>
                          {lead.status || "new"}
                        </Badge>
                      </div>
                      
                      {/* Info Row - Compact */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone_number || "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="h-3 w-3" />
                          {lead.bike_model || "-"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions - Compact */}
                    <LeadActions lead={lead} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  // Desktop Table View
  const DesktopTableView = () => (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Bike Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.full_name || "-"}</TableCell>
                <TableCell>{lead.phone_number || "-"}</TableCell>
                <TableCell>{lead.bike_model || "-"}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status || "new"]}>
                    {lead.status || "new"}
                  </Badge>
                </TableCell>
                <TableCell>{lead.purchase_timeline || "-"}</TableCell>
                <TableCell>
                  {lead.created_at
                    ? format(new Date(lead.created_at), "MMM dd, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <LeadActions lead={lead} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-3 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {/* Filters - Compact on mobile */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px] md:w-[150px] h-9 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content - Mobile Cards or Desktop Table */}
          {isMobile ? <MobileCardView /> : <DesktopTableView />}

          {/* Footer */}
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            {filteredLeads.length} of {leads.length} leads
          </p>
        </div>
      </CardContent>
    </Card>
  );
}