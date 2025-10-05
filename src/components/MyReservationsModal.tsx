import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { format, addMinutes, parse } from 'date-fns';

type Booking = Database['public']['Tables']['bookings']['Row'] & { restaurant_tables: Database['public']['Tables']['restaurant_tables']['Row'] | null };

interface MyReservationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MyReservationsModal = ({ open, onOpenChange }: MyReservationsModalProps) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserBookings = async () => {
            setLoading(true);
            try {
                // RLS will automatically filter this to the user's own bookings
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*, restaurant_tables(*)')
                    .order('booking_date', { ascending: false });
                
                if (error) throw error;
                setBookings(data as Booking[] || []);
            } catch (error: any) {
                toast.error(`Failed to fetch bookings: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

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
                // Refetch bookings
                const updatedBookings = bookings.filter(b => b.group_id !== groupId);
                setBookings(updatedBookings);
            } catch (error: any) {
                 toast.error(`Cancellation failed: ${error.message}`);
            }
        }
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>My Reservations</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {loading ? <p>Loading...</p> : (
                bookings.length > 0 ? bookings.map(booking => (
                    <Card key={booking.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Table {booking.restaurant_tables?.table_number}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(parse(booking.booking_date, 'yyyy-MM-dd', new Date()), 'E, MMM d')} at {booking.booking_time.substring(0,5)}
                                </p>
                                <p className="text-xs text-muted-foreground">Party of {booking.party_size}</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleCancel(booking.group_id)}>Cancel</Button>
                        </CardContent>
                    </Card>
                )) : <p>You have no upcoming reservations.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyReservationsModal;