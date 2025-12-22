import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  UserCircle,
  BarChart3 
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

export function MobileBottomNav() {
  const { role } = useAuth();

  const isAdmin = role === "admin";

  const adminNavItems = [
    { title: "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: "Leads", url: "/dashboard/leads", icon: FileText },
    { title: "Team", url: "/dashboard/performance", icon: BarChart3 },
    { title: "Users", url: "/dashboard/users", icon: Users },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const salesmanNavItems = [
    { title: "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Leads", url: "/dashboard/my-leads", icon: FileText },
    { title: "Profile", url: "/dashboard/profile", icon: UserCircle },
  ];

  const navItems = isAdmin ? adminNavItems : salesmanNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/dashboard"}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
