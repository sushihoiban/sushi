import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// This is the shape of the customer data the modal will receive.
// It matches the 'customer_details' type from our 'filter_customers' function.
type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
};

interface EditCustomerModalProps {
    customer: Customer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCustomerUpdated: () => void;
}

const EditCustomerModal = ({ customer, open, onOpenChange, onCustomerUpdated }: EditCustomerModalProps) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // When a customer is selected, populate the form fields with their data.
    useEffect(() => {
        if (customer) {
            setFirstName(customer.first_name || '');
            setLastName(customer.last_name || '');
            setPhone(customer.phone || '');
        }
    }, [customer]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;

        setLoading(true);
        try {
            const { error } = await supabase.rpc('update_customer_details', {
                p_customer_id: customer.id,
                p_first_name: firstName,
                p_last_name: lastName,
                p_phone: phone,
            });

            if (error) throw error;

            toast.success('Customer details updated successfully!');
            onCustomerUpdated(); // This will trigger a refresh of the customer list.
            onOpenChange(false); // Close the modal.
        } catch (error: any) {
            console.error('Error updating customer:', error);
            toast.error(`Failed to update customer: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Customer Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdate}>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={customer?.email || 'N/A'}
                                className="col-span-3"
                                disabled
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCustomerModal;
