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
import { toast } from 'sonner';
import { format, addMinutes, parse } from 'date-fns';
import EditBookingModal from '@/components/EditBookingModal';
import { useAdminState } from '@/hooks/use-admin-state';

// Corresponds to the 'admin_booking_row' type in the new SQL function
interface AdminBooking {
    id: string;
    booking_date: string;
    booking_time: string;
    party_size: number;
    group_id: string;
    customer_name: string;
    customer_phone: string;
    tables: string;
}

// The BookingGroup for the Edit modal needs a different structure.
// We'll create it on the fly when the user clicks "Edit".
interface BookingGroupForEdit {
    group_id: string;
    customer: {
        name: string;
        phone: string;
    };
    booking_date: string;
    booking_time: string;
    total_party_size: number;
    bookings: { 
        restaurant_tables: { table_number: number } | null;
    }[];
}


const AdminBookings = () => {
    const { bookingTrigger } = useAdminState();
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBookingGroup, setEditingBookingGroup] = useState<BookingGroupForEdit | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_admin_bookings');
            if (error) {
                console.error("Error fetching bookings:", error);
                throw error;
            }
            setBookings(data || []);
        } catch (error) {
            toast.error("Failed to load bookings. See console for details.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings, bookingTrigger]);

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

    const handleEditClick = (booking: AdminBooking) => {
        const groupForEdit: BookingGroupForEdit = {
            group_id: booking.group_id,
            customer: {
                name: booking.customer_name,
                phone: booking.customer_phone,
            },
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            total_party_size: booking.party_size,
            bookings: booking.tables.split(',').map(tn => ({
                restaurant_tables: { table_number: parseInt(tn.trim(), 10) }
            })),
        };
        setEditingBookingGroup(groupForEdit);
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
                    {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>{booking.tables}</TableCell>
                            <TableCell>{booking.customer_name || 'N/A'}</TableCell>
                            <TableCell>{booking.party_size}</TableCell>
                            <TableCell>{booking.booking_date}</TableCell>
                            <TableCell>{booking.booking_time.substring(0,5)}</TableCell>
                            <TableCell>{getEndTime(booking.booking_time)}</TableCell>
                            <TableCell className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(booking)}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleCancelGroup(booking.group_id)}>Cancel</Button>
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