import { useState } from "react";
import { Lead } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: Partial<Lead>) => void;
}

const bikeModels = [
  "Apache RTR 160",
  "Apache RTR 180",
  "Apache RTR 200",
  "Apache RR 310",
  "Jupiter",
  "Ntorq",
  "iQube",
  "Raider",
  "Ronin",
];

const purchaseTimelines = [
  "Immediate",
  "Within 1 week",
  "Within 1 month",
  "Within 3 months",
  "Just exploring",
];

export function LeadForm({ lead, onSubmit }: LeadFormProps) {
  const [formData, setFormData] = useState({
    full_name: lead?.full_name || "",
    phone_number: lead?.phone_number || "",
    bike_model: lead?.bike_model || "",
    post_code: lead?.post_code || "",
    purchase_timeline: lead?.purchase_timeline || "",
    status: lead?.status || "new",
    notes: lead?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) =>
              setFormData({ ...formData, phone_number: e.target.value })
            }
            placeholder="+91 9876543210"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bike_model">Bike Model</Label>
          <Select
            value={formData.bike_model}
            onValueChange={(value) =>
              setFormData({ ...formData, bike_model: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {bikeModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="post_code">Post Code</Label>
          <Input
            id="post_code"
            value={formData.post_code}
            onChange={(e) =>
              setFormData({ ...formData, post_code: e.target.value })
            }
            placeholder="110001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_timeline">Purchase Timeline</Label>
          <Select
            value={formData.purchase_timeline}
            onValueChange={(value) =>
              setFormData({ ...formData, purchase_timeline: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {purchaseTimelines.map((timeline) => (
                <SelectItem key={timeline} value={timeline}>
                  {timeline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add notes about this lead..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        {lead ? "Update Lead" : "Create Lead"}
      </Button>
    </form>
  );
}
