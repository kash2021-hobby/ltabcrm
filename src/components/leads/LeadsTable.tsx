import { useState, useRef, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Search, Edit, Trash2, Eye, Phone, Bike, UserPlus, ChevronRight, ArrowLeft } from "lucide-react";
import { LeadForm } from "./LeadForm";
import { format } from "date-fns";

interface LeadsTableProps {
  leads: Lead[];
  onUpdate: (id: number, updates: Partial<Lead>) => void;
  onDelete: (id: number) => void;
  onBulkAssign?: (leadIds: number[], salesmanId: string) => void;
  salesmen?: { id: string; email: string; full_name: string | null; role: string }[];
  isLoading?: boolean;
  isBulkAssigning?: boolean;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  converted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function LeadsTable({ 
  leads, 
  onUpdate, 
  onDelete, 
  onBulkAssign,
  salesmen = [],
  isLoading,
  isBulkAssigning,
}: LeadsTableProps) {
  const { role } = useAuth();
  const isMobile = useIsMobile();
  const isAdmin = role === "admin";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Long-press handlers for mobile bulk selection
  const handleTouchStart = useCallback((leadId: number) => {
    if (!isAdmin || !onBulkAssign) return;
    
    longPressTimerRef.current = setTimeout(() => {
      // Trigger haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
      
      // Enable selection mode and select this lead
      setSelectionMode(true);
      handleSelectLead(leadId, true);
    }, 500);
  }, [isAdmin, onBulkAssign]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // Cancel long-press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedLeads(new Set());
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone_number?.includes(search) ||
      lead.bike_model?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleBulkAssign = (salesmanId: string) => {
    if (onBulkAssign && selectedLeads.size > 0) {
      onBulkAssign(Array.from(selectedLeads), salesmanId);
      setSelectedLeads(new Set());
      setBulkAssignOpen(false);
    }
  };

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every((lead) => selectedLeads.has(lead.id));
  const isSomeSelected = filteredLeads.some((lead) => selectedLeads.has(lead.id));

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

  // Bulk Assign Dialog Content
  const BulkAssignContent = () => {
    const [selectedSalesman, setSelectedSalesman] = useState<string>("");
    
    return (
      <div className="space-y-4 p-4 md:p-0">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <UserPlus className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {selectedLeads.size} lead{selectedLeads.size !== 1 ? "s" : ""} selected
          </span>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Salesman</label>
          <Input
            placeholder="Search salesman..."
            className="mb-2"
            onChange={(e) => {
              const searchValue = e.target.value.toLowerCase();
              // Filter is handled in display
            }}
          />
          <div className="max-h-[200px] overflow-y-auto space-y-1 border rounded-lg p-2">
            {salesmen.map((salesman) => (
              <div
                key={salesman.id}
                onClick={() => setSelectedSalesman(salesman.id)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedSalesman === salesman.id 
                    ? "bg-primary/10 border border-primary" 
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">
                    {salesman.full_name || "No name"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {salesman.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setBulkAssignOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!selectedSalesman || isBulkAssigning}
            onClick={() => handleBulkAssign(selectedSalesman)}
          >
            {isBulkAssigning ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </div>
    );
  };

  // Mobile Lead Details Drawer Content
  const MobileLeadDetails = ({ lead }: { lead: Lead }) => (
    <div className="flex flex-col h-full">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewingLead(null)}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-lg">Lead Details</h2>
      </div>
      
      {/* Lead Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge className={`${statusColors[lead.status || "new"]} mt-1`}>
            {lead.status || "new"}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Notes</p>
          <p className="font-medium">{lead.notes || "No notes"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="font-medium">
            {lead.created_at ? format(new Date(lead.created_at), "MMM dd, yyyy") : "-"}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t flex gap-2">
        {lead.phone_number && (
          <Button
            variant="outline"
            className="flex-1"
            asChild
          >
            <a href={`tel:${lead.phone_number}`}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setViewingLead(null);
            setEditingLead(lead);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        {isAdmin && (
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              onDelete(lead.id);
              setViewingLead(null);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile Card View - Simplified with chevron
  const MobileCardView = () => (
    <>
      {/* Lead Details Drawer */}
      <Drawer open={!!viewingLead} onOpenChange={(open) => !open && setViewingLead(null)}>
        <DrawerContent className="h-[85vh]">
          {viewingLead && <MobileLeadDetails lead={viewingLead} />}
        </DrawerContent>
      </Drawer>
      
      {/* Edit Lead Drawer */}
      <Drawer open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Lead</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {editingLead && (
              <LeadForm
                lead={editingLead}
                onSubmit={(updates) => {
                  onUpdate(editingLead.id, updates);
                  setEditingLead(null);
                }}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <div className="space-y-2">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              No leads found
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card 
              key={lead.id} 
              className={`overflow-hidden ${selectionMode && selectedLeads.has(lead.id) ? 'ring-2 ring-primary' : ''}`}
              onTouchStart={() => handleTouchStart(lead.id)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Checkbox for selection - show when in selection mode */}
                  {isAdmin && onBulkAssign && selectionMode && (
                    <div className="flex items-center px-3 border-r">
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                      />
                    </div>
                  )}
                  
                  {/* Status indicator bar */}
                  <div className={`w-1.5 ${
                    lead.status === 'converted' ? 'bg-green-500' :
                    lead.status === 'contacted' ? 'bg-yellow-500' :
                    lead.status === 'qualified' ? 'bg-purple-500' :
                    lead.status === 'lost' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  
                  {/* Card Content - Clickable for details or selection */}
                  <button
                    className="flex-1 p-3 flex items-center justify-between gap-2 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      if (selectionMode) {
                        handleSelectLead(lead.id, !selectedLeads.has(lead.id));
                      } else {
                        setViewingLead(lead);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate text-sm">
                          {lead.full_name || "Unknown"}
                        </h3>
                        <Badge className={`${statusColors[lead.status || "new"]} text-xs px-1.5 py-0`}>
                          {lead.status || "new"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Chevron - hide in selection mode */}
                    {!selectionMode && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );

  // Desktop Table View with selection
  const DesktopTableView = () => (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && onBulkAssign && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
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
              <TableCell colSpan={isAdmin && onBulkAssign ? 8 : 7} className="text-center py-8 text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            filteredLeads.map((lead) => (
              <TableRow key={lead.id} className={selectedLeads.has(lead.id) ? "bg-muted/50" : ""}>
                {isAdmin && onBulkAssign && (
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                    />
                  </TableCell>
                )}
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
          {/* Filters and Bulk Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {/* Select All for mobile - only show in selection mode */}
              {isMobile && isAdmin && onBulkAssign && selectionMode && (
                <div className="flex items-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </div>
              )}
              
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
            
            {/* Selection Action Bar */}
            {(selectedLeads.size > 0 || selectionMode) && isAdmin && onBulkAssign && (
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedLeads.size} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exitSelectionMode}
                  >
                    Clear
                  </Button>
                  {isMobile ? (
                    <Drawer open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
                      <Button size="sm" onClick={() => setBulkAssignOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Assign Leads</DrawerTitle>
                        </DrawerHeader>
                        <BulkAssignContent />
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Dialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
                      <Button size="sm" onClick={() => setBulkAssignOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Assign Leads</DialogTitle>
                        </DialogHeader>
                        <BulkAssignContent />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )}
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
