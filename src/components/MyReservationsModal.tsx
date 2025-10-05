import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { format, addMinutes, parse } from 'date-fns';
import EditBookingModal from "./EditBookingModal"; // Import the modal

type Booking = Database['public']['Tables']['bookings']['Row'] & { 
    restaurant_tables: Database['public']['Tables']['restaurant_tables']['Row'] | null;
    customers: Database['public']['Tables']['customers']['Row'] | null; // Customers might be null
};

// This must match the group interface in AdminBookings.tsx and EditBookingModal.tsx
interface BookingGroup {
    group_id: string;
    bookings: Booking[];
    total_party_size: number;
    customer: { name: string, phone: string | null } | null;
    booking_date: string;
    booking_time: string;
}

interface MyReservationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MyReservationsModal = ({ open, onOpenChange }: MyReservationsModalProps) => {
    const [bookingGroups, setBookingGroups] = useState<BookingGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBookingGroup, setEditingBookingGroup] = useState<BookingGroup | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchUserBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, restaurant_tables(*), customers(*)')
                .order('booking_date', { ascending: false });
            
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

        } catch (error: any) {
            toast.error(`Failed to fetch bookings: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(open) {
            fetchUserBookings();
        }
    }, [open]);

    const handleCancel = async (groupId: string) => {
        if(window.confirm("Are you sure you want to cancel this reservation?")) {
            try {
                const { error } = await supabase.rpc('cancel_booking_group', { p_group_id: groupId });
                if (error) throw error;
                toast.success("Reservation cancelled.");
                fetchUserBookings(); // Refetch all bookings
            } catch (error: any) {
                 toast.error(`Cancellation failed: ${error.message}`);
            }
        }
    }

    const handleEditClick = (group: BookingGroup) => {
        setEditingBookingGroup(group);
        setIsEditModalOpen(true);
    }

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>My Reservations</DialogTitle></DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
                {loading ? <p>Loading...</p> : (
                    bookingGroups.length > 0 ? bookingGroups.map(group => (
                        <Card key={group.group_id}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">
                                        {group.bookings.map(b => `T${b.restaurant_tables?.table_number}`).join(', ')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(parse(group.booking_date, 'yyyy-MM-dd', new Date()), 'E, MMM d')} at {group.booking_time.substring(0,5)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Party of {group.total_party_size}</p>
                                </div>
                                <div className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(group)}>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleCancel(group.group_id)}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )) : <p>You have no upcoming reservations.</p>
                )}
            </div>
        </DialogContent>
        </Dialog>
        <EditBookingModal 
            bookingGroup={editingBookingGroup}
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onBookingUpdated={() => {
                fetchUserBookings(); // Refetch the user's bookings after an update
            }}
        />
    </>
  );
};

export default MyReservationsModal;