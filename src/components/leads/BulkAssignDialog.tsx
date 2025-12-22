import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  salesmen: User[];
  onAssign: (salesmanId: string) => void;
  isLoading?: boolean;
}

export function BulkAssignDialog({
  open,
  onOpenChange,
  selectedCount,
  salesmen,
  onAssign,
  isLoading,
}: BulkAssignDialogProps) {
  const isMobile = useIsMobile();
  const [selectedSalesman, setSelectedSalesman] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedSalesman) {
      onAssign(selectedSalesman);
      setSelectedSalesman(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedSalesman(null);
    }
    onOpenChange(open);
  };

  const Content = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Users className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">
          {selectedCount} lead{selectedCount !== 1 ? "s" : ""} selected
        </span>
      </div>
      
      <Command className="border rounded-lg">
        <CommandInput placeholder="Search salesman..." />
        <CommandList className="max-h-[200px]">
          <CommandEmpty>No salesman found.</CommandEmpty>
          <CommandGroup>
            {salesmen.map((salesman) => (
              <CommandItem
                key={salesman.id}
                value={salesman.full_name || salesman.email}
                onSelect={() => setSelectedSalesman(salesman.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {salesman.full_name || "No name"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {salesman.email}
                    </p>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedSalesman === salesman.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );

  const FooterButtons = (
    <>
      <Button variant="outline" onClick={() => handleOpenChange(false)}>
        Cancel
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={!selectedSalesman || isLoading}
      >
        {isLoading ? "Assigning..." : "Assign"}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Assign Leads</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {Content}
          </div>
          <DrawerFooter className="flex-row gap-2">
            {FooterButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
        </DialogHeader>
        {Content}
        <DialogFooter>
          {FooterButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
