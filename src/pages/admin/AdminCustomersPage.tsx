import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddCustomerModal from '@/components/AddCustomerModal';
import EditCustomerModal from '@/components/EditCustomerModal'; // Import the new modal

// This is the shape of the customer data we get from our 'filter_customers' function.
type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    user_id: string;
    status: 'regular' | 'vip';
};

const fetchCustomers = async (nameFilter: string, bookingStatusFilter: string): Promise<Customer[]> => {
    const { data, error } = await supabase.rpc('filter_customers', {
        name_filter: nameFilter || null,
        booking_status_filter: bookingStatusFilter,
    });
    if (error) throw error;
    return (data as any) || []; // Cast to any to avoid type errors with generated types
}

const AdminCustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [nameFilter, setNameFilter] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchCustomers(nameFilter, bookingStatusFilter);
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    }, [nameFilter, bookingStatusFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            loadCustomers();
        }, 300);
        return () => clearTimeout(debounce);
    }, [loadCustomers]);

    const handleEditClick = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const formatPhoneNumber = (phone: string | null) => {
        if (!phone) return '';
        return phone.replace(/\D/g, '');
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold">Manage Customers</h1>
                    <p className="text-muted-foreground">View, filter, and add new customers.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>Add New Customer</Button>
            </div>
            
            <div className="flex gap-4 mb-4">
                <Input 
                    placeholder="Filter by name..." 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="max-w-xs"
                />
                <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by booking" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="active">Has Active Booking</SelectItem>
                        <SelectItem value="none">No Active Booking</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? <div>Loading customers...</div> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>{`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A'}</TableCell>
                                <TableCell>{customer.phone || 'N/A'}</TableCell>
                                <TableCell>{customer.email || 'N/A'}</TableCell>
                                <TableCell>{customer.user_id ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{customer.status}</TableCell>
                                <TableCell className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(customer)}>Edit</Button>
                                    {customer.phone && (
                                        <>
                                            <Button asChild size="icon" variant="outline">
                                                <a href={`https://wa.me/${formatPhoneNumber(customer.phone)}`} target="_blank" rel="noopener noreferrer">
                                                    <i className="ri-whatsapp-line text-green-500" />
                                                </a>
                                            </Button>
                                            <Button asChild size="icon" variant="outline">
                                                <a href={`https://zalo.me/${formatPhoneNumber(customer.phone)}`} target="_blank" rel="noopener noreferrer">
                                                    <i className="ri-message-2-line text-blue-500" />
                                                </a>
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            <AddCustomerModal 
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onCustomerAdded={loadCustomers}
            />
            <EditCustomerModal
                customer={selectedCustomer}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onCustomerUpdated={loadCustomers}
            />
        </div>
    );
};

export default AdminCustomersPage;
