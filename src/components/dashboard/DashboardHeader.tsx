import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  title: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { role } = useAuth();

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-3 sm:px-6">
      <SidebarTrigger className="shrink-0" />
      <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
        <Badge variant="outline" className="capitalize shrink-0 text-xs sm:text-sm">
          {role}
        </Badge>
      </div>
    </header>
  );
}