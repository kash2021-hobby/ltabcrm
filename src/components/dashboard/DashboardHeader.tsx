import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  title: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { role } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger className="-ml-2" />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <Badge variant="outline" className="capitalize">
          {role}
        </Badge>
      </div>
    </header>
  );
}
