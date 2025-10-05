import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
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

type Customer = Database['public']['Tables']['customers']['Row'];

const AdminCustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [nameFilter, setNameFilter] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('filter_customers', {
                name_filter: nameFilter || null,
                booking_status_filter: bookingStatusFilter,
            });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    }, [nameFilter, bookingStatusFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchCustomers();
        }, 300); // Debounce text input
        return () => clearTimeout(debounce);
    }, [fetchCustomers, nameFilter, bookingStatusFilter]);

    const formatPhoneNumber = (phone: string | null) => {
        if (!phone) return '';
        return phone.replace(/\D/g, '');
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Manage Customers</h1>
            <p className="text-muted-foreground mb-6">View and contact your customers.</p>
            
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.phone || 'N/A'}</TableCell>
                            <TableCell>{customer.status}</TableCell>
                            <TableCell className="space-x-2">
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
        </div>
    );
};

export default AdminCustomersPage;