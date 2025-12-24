import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LeadActivity } from "./useLeads";

export function useLeadActivities(leadId: number | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from("lead_activities")
        .select(`
          *,
          created_by_profile:profiles(full_name, email)
        `)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (LeadActivity & { created_by_profile: { full_name: string | null; email: string } | null })[];
    },
    enabled: !!leadId,
  });

  const addActivity = useMutation({
    mutationFn: async ({
      leadId,
      activityType,
      activityText
    }: {
      leadId: number;
      activityType: LeadActivity['activity_type'];
      activityText: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("lead_activities")
        .insert([{
          lead_id: leadId,
          activity_type: activityType,
          activity_text: activityText,
          created_by: user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["lead-activities", leadId] });
      toast({ title: "Activity added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error adding activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    activities,
    isLoading,
    error,
    addActivity,
  };
}
