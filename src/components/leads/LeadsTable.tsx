import { useState } from "react";
import { Lead } from "@/hooks/useLeads";
import { useAuth } from "@/contexts/AuthContext";
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
import { Search, Edit, Trash2, Eye } from "lucide-react";
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
  const isAdmin = role === "admin";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingLead(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Lead Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
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
                        </DialogContent>
                      </Dialog>

                      {/* Edit Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingLead(lead)}
                          >
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
                              setEditingLead(null);
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredLeads.length} of {leads.length} leads
      </p>
    </div>
  );
}
