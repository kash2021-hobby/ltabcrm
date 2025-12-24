import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLeads, Lead, LeadStatus } from "@/hooks/useLeads";
import { useLeadActivities } from "@/hooks/useLeadActivities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, FileText, Clock, User, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const leadId = id ? parseInt(id) : null;

  const { leads, updateLead } = useLeads();
  const { activities, isLoading: activitiesLoading } = useLeadActivities(leadId);

  const lead = leads.find((l) => l.id === leadId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({});

  if (!lead) {
    return (
      <DashboardLayout title="Lead Not Found">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Lead not found</p>
            <Button onClick={() => navigate("/leads")} className="mt-4">
              Back to Leads
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const handleEdit = () => {
    setFormData({
      status: lead.status,
      next_followup_date: lead.next_followup_date,
      followup_note: lead.followup_note,
      notes: lead.notes,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateLead.mutate({ id: lead.id, updates: formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const statusColors: Record<LeadStatus, string> = {
    cold: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    warm: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    hot: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    converted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  const activityIcons: Record<string, any> = {
    status_change: TrendingUp,
    followup_scheduled: Calendar,
    note_added: FileText,
    converted: CheckCircle2,
    lost: AlertCircle,
  };

  return (
    <DashboardLayout title={lead.full_name || "Lead Details"}>
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/leads")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: LeadStatus) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.status !== "converted" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="next_followup_date">Next Follow-up Date</Label>
                          <Input
                            id="next_followup_date"
                            type="date"
                            value={formData.next_followup_date || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, next_followup_date: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="followup_note">Follow-up Note</Label>
                          <Textarea
                            id="followup_note"
                            value={formData.followup_note || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, followup_note: e.target.value })
                            }
                            placeholder="What needs to be done on follow-up?"
                            rows={3}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Add notes about this lead..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={updateLead.isPending}>
                        {updateLead.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={`${statusColors[lead.status]} mt-1`}>
                          {lead.status}
                        </Badge>
                      </div>
                      <Button onClick={handleEdit} size="sm">
                        Edit
                      </Button>
                    </div>

                    {lead.status !== "converted" && lead.next_followup_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Next Follow-up Date</p>
                        <p className="font-medium flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(lead.next_followup_date), "MMMM dd, yyyy")}
                        </p>
                      </div>
                    )}

                    {lead.status !== "converted" && lead.followup_note && (
                      <div>
                        <p className="text-sm text-muted-foreground">Follow-up Note</p>
                        <p className="font-medium mt-1">{lead.followup_note}</p>
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold mb-3">Contact Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{lead.full_name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{lead.phone_number || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Post Code</p>
                          <p className="font-medium">{lead.post_code || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Lead Details</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Bike Model</p>
                          <p className="font-medium">{lead.bike_model || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Purchase Timeline</p>
                          <p className="font-medium">{lead.purchase_timeline || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {lead.created_at ? format(new Date(lead.created_at), "MMM dd, yyyy") : "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {lead.notes && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="font-medium mt-1">{lead.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {activitiesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No activity yet</div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const IconComponent = activityIcons[activity.activity_type] || FileText;
                      return (
                        <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.activity_text}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{activity.created_by_profile?.full_name || activity.created_by_profile?.email || "System"}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(activity.created_at), "MMM dd, yyyy HH:mm")}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
