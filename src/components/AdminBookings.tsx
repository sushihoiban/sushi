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

// This interface represents a "grouped" booking for the UI
interface BookingGroup {
    group_id: string;
    bookings: Booking[];
    total_party_size: number;
    customer: Database['public']['Tables']['customers']['Row'] | null;
    booking_date: string;
    booking_time: string;
}


const AdminBookings = () => {
    const [bookingGroups, setBookingGroups] = useState<BookingGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBookingGroup, setEditingBookingGroup] = useState<BookingGroup | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, restaurant_tables(*), customers(*)')
                .order('booking_date', { ascending: false })
                .order('booking_time', { ascending: true });
            if (error) throw error;

            // Group bookings by group_id
            const groups: { [key: string]: BookingGroup } = {};
            for (const booking of data as Booking[]) {
                if (!groups[booking.group_id]) {
                    groups[booking.group_id] = {
                        group_id: booking.group_id,
                        bookings: [],
                        total_party_size: 0,
                        customer: booking.customers,
                        booking_date: booking.booking_date,
                        booking_time: booking.booking_time,
                    };
                }
                groups[booking.group_id].bookings.push(booking);
                groups[booking.group_id].total_party_size += booking.party_size;
            }
            setBookingGroups(Object.values(groups));

        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    
    const handleCancelGroup = async (groupId: string) => {
        if (window.confirm('Are you sure you want to cancel this entire booking?')) {
            try {
                const { error } = await supabase.rpc('cancel_booking_group', { p_group_id: groupId });
                if (error) throw error;
                toast.success('Booking cancelled successfully.');
                fetchBookings();
            } catch (error: any) {
                toast.error(`Failed to cancel booking: ${error.message}`);
            }
        }
    }
    
    const handleEditClick = (group: BookingGroup) => {
        setEditingBookingGroup(group);
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
                        <TableHead>Tables</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Party Size</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookingGroups.map((group) => (
                        <TableRow key={group.group_id}>
                            <TableCell>{group.bookings.map(b => `T${b.restaurant_tables?.table_number}`).join(', ')}</TableCell>
                            <TableCell>{group.customer?.name || 'N/A'}</TableCell>
                            <TableCell>{group.total_party_size}</TableCell>
                            <TableCell>{group.booking_date}</TableCell>
                            <TableCell>{group.booking_time.substring(0,5)}</TableCell>
                            <TableCell>{getEndTime(group.booking_time)}</TableCell>
                            <TableCell className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(group)}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleCancelGroup(group.group_id)}>Cancel</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <EditBookingModal 
                bookingGroup={editingBookingGroup}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onBookingUpdated={fetchBookings}
            />
        </>
    );
}

export default AdminBookings;