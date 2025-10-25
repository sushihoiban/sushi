import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: () => void;
}

const AddCustomerModal = ({ open, onOpenChange, onCustomerAdded }: AddCustomerModalProps) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'regular' | 'vip'>('regular');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name) {
            toast.error("Customer name is required.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from('customers').insert({ name, phone, status });
            if (error) throw error;
            
            toast.success("Customer created successfully!");
            onCustomerAdded(); // Trigger refetch on the parent page
            onOpenChange(false); // Close the modal
            // Reset form
            setName('');
            setPhone('');
            setStatus('regular');
        } catch (error: any) {
            toast.error(`Failed to create customer: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label htmlFor="new-customer-name">Name</Label>
                <Input id="new-customer-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="new-customer-phone">Phone</Label>
                <Input id="new-customer-phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="new-customer-status">Status</Label>
                <Select onValueChange={(value: 'regular' | 'vip') => setStatus(value)} defaultValue="regular">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Customer"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;