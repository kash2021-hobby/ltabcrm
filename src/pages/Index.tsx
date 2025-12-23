import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
            T
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">TVS CRM</h1>
          <p className="text-xl text-muted-foreground">
            Manage your leads and sales efficiently
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <Button asChild size="lg">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        <div className="pt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">500+</p>
            <p className="text-sm text-muted-foreground">Leads Managed</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">98%</p>
            <p className="text-sm text-muted-foreground">User Satisfaction</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary">24/7</p>
            <p className="text-sm text-muted-foreground">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
