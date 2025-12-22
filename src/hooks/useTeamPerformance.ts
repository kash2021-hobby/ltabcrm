import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalesmanStats {
  userId: string;
  email: string;
  fullName: string | null;
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
}

export function useTeamPerformance() {
  return useQuery({
    queryKey: ["team-performance"],
    queryFn: async (): Promise<SalesmanStats[]> => {
      // Fetch all salesmen
      const { data: salesmenRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "salesman");

      if (rolesError) throw rolesError;

      if (!salesmenRoles || salesmenRoles.length === 0) {
        return [];
      }

      const salesmenIds = salesmenRoles.map((r) => r.user_id);

      // Fetch profiles for salesmen
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", salesmenIds);

      if (profilesError) throw profilesError;

      // Fetch all leads
      const { data: leads, error: leadsError } = await supabase
        .from("tvs_leads")
        .select("assigned_to, status");

      if (leadsError) throw leadsError;

      // Calculate stats for each salesman
      const statsMap = new Map<string, SalesmanStats>();

      // Initialize stats for all salesmen
      for (const profile of profiles || []) {
        statsMap.set(profile.id, {
          userId: profile.id,
          email: profile.email || "Unknown",
          fullName: profile.full_name,
          totalLeads: 0,
          newLeads: 0,
          contactedLeads: 0,
          qualifiedLeads: 0,
          convertedLeads: 0,
          lostLeads: 0,
          conversionRate: 0,
        });
      }

      // Aggregate leads data
      for (const lead of leads || []) {
        if (!lead.assigned_to) continue;
        
        const stats = statsMap.get(lead.assigned_to);
        if (!stats) continue;

        stats.totalLeads++;
        
        switch (lead.status) {
          case "new":
            stats.newLeads++;
            break;
          case "contacted":
            stats.contactedLeads++;
            break;
          case "qualified":
            stats.qualifiedLeads++;
            break;
          case "converted":
            stats.convertedLeads++;
            break;
          case "lost":
            stats.lostLeads++;
            break;
        }
      }

      // Calculate conversion rates
      for (const stats of statsMap.values()) {
        if (stats.totalLeads > 0) {
          stats.conversionRate = (stats.convertedLeads / stats.totalLeads) * 100;
        }
      }

      return Array.from(statsMap.values()).sort((a, b) => b.totalLeads - a.totalLeads);
    },
  });
}
