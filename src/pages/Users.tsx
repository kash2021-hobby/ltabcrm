import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useUsers, UserWithRole } from "@/hooks/useUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { Mail, Calendar } from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  salesman: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export default function Users() {
  const { users, isLoading, updateUserRole, createUser } = useUsers();
  const isMobile = useIsMobile();

  const handleRoleChange = (userId: string, role: UserWithRole["role"]) => {
    updateUserRole.mutate({ userId, role });
  };

  const handleCreateUser = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: UserWithRole["role"];
  }) => {
    await createUser.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="User Management">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Mobile Card View
  const MobileCardView = () => (
    <div className="space-y-3">
      {users.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
            No users found
          </CardContent>
        </Card>
      ) : (
        users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {user.full_name || "No name"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                  <Badge className={roleColors[user.role]}>
                    {user.role}
                  </Badge>
                </div>

                {/* Details & Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {user.created_at
                        ? format(new Date(user.created_at), "MMM dd, yyyy")
                        : "-"}
                    </span>
                  </div>
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, value as UserWithRole["role"])
                    }
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="salesman">Salesman</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  // Desktop Table View
  const DesktopTableView = () => (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {user.full_name || "No name"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role]}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.created_at
                    ? format(new Date(user.created_at), "MMM dd, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, value as UserWithRole["role"])
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="salesman">Salesman</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-3 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Manage user accounts and their roles
          </p>
          <CreateUserDialog 
            onCreateUser={handleCreateUser} 
            isLoading={createUser.isPending} 
          />
        </div>

        {isMobile ? <MobileCardView /> : <DesktopTableView />}
      </div>
    </DashboardLayout>
  );
}