import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type LeadStatus = 'cold' | 'warm' | 'hot' | 'converted';
export type ActivityType = 'status_change' | 'followup_scheduled' | 'note_added' | 'converted' | 'lost';

export interface Lead {
  id: number;
  full_name: string | null;
  phone_number: string | null;
  bike_model: string | null;
  lead_time: string | null;
  post_code: string | null;
  purchase_timeline: string | null;
  source: string | null;
  created_at: string | null;
  assigned_to: string | null;
  status: LeadStatus;
  notes: string | null;
  next_followup_date: string | null;
  followup_note: string | null;
}

export interface LeadActivity {
  id: string;
  lead_id: number;
  activity_type: ActivityType;
  activity_text: string;
  created_by: string | null;
  created_at: string;
}

export function useLeads() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ["leads", role, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("tvs_leads")
        .select("*")
        .order("next_followup_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      // Salesmen only see their assigned leads
      if (role === "salesman" && user?.id) {
        query = query.eq("assigned_to", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Omit<Partial<Lead>, "id"> }) => {
      const { id: _, ...safeUpdates } = updates as Partial<Lead>;
      const { error } = await supabase
        .from("tvs_leads")
        .update(safeUpdates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error updating lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("tvs_leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error deleting lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createLead = useMutation({
    mutationFn: async (newLead: Omit<Partial<Lead>, "id" | "created_at">) => {
      const { error } = await supabase
        .from("tvs_leads")
        .insert([newLead]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error creating lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkAssignLeads = useMutation({
    mutationFn: async ({ leadIds, salesmanId }: { leadIds: number[]; salesmanId: string }) => {
      const { error } = await supabase
        .from("tvs_leads")
        .update({ assigned_to: salesmanId })
        .in("id", leadIds);

      if (error) throw error;
    },
    onSuccess: (_, { leadIds }) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: `${leadIds.length} leads assigned successfully` });
    },
    onError: (error) => {
      toast({
        title: "Error assigning leads",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    leads,
    isLoading,
    error,
    updateLead,
    deleteLead,
    createLead,
    bulkAssignLeads,
  };
}
