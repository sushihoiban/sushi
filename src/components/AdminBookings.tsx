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
import { toast } from 'sonner';
import { format, addMinutes, parse } from 'date-fns';
import EditBookingModal from '@/components/EditBookingModal';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    restaurant_tables: Database['public']['Tables']['restaurant_tables']['Row'] | null;
    customers: Database['public']['Tables']['customers']['Row'] | null;
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, restaurant_tables(*), customers(*)')
                .order('booking_date', { ascending: false, nullsFirst: false })
                .order('booking_time', { ascending: true });
            if (error) throw error;
            setBookings(data as Booking[] || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    
    const handleCancelBooking = async (bookingId: string) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
                if (error) throw error;
                toast.success('Booking cancelled successfully.');
                fetchBookings();
            } catch (error: any) {
                toast.error(`Failed to cancel booking: ${error.message}`);
            }
        }
    }
    
    const handleEditClick = (booking: Booking) => {
        setEditingBooking(booking);
        setIsEditModalOpen(true);
    }

    const getEndTime = (time: string) => {
        try {
            const startTime = parse(time, 'HH:mm:ss', new Date());
            return format(addMinutes(startTime, 90), 'HH:mm');
        } catch (e) { return "Invalid"; }
    }

    if(loading) return <div>Loading bookings...</div>

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Party Size</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>{booking.restaurant_tables?.table_number || 'N/A'}</TableCell>
                            <TableCell>{booking.customers?.name || 'N/A'}</TableCell>
                            <TableCell>{booking.party_size || 'N/A'}</TableCell>
                            <TableCell>{booking.booking_date}</TableCell>
                            <TableCell>{booking.booking_time.substring(0,5)}</TableCell>
                            <TableCell>{getEndTime(booking.booking_time)}</TableCell>
                            <TableCell className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(booking)}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking.id)}>Cancel</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <EditBookingModal 
                booking={editingBooking}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onBookingUpdated={fetchBookings}
            />
        </>
    );
}

export default AdminBookings;