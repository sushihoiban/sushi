import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/hooks/use-booking";
import { format, parse } from 'date-fns';

// This must match the group interface in AdminBookings.tsx
interface BookingGroup {
    group_id: string;
    bookings: any[];
    total_party_size: number;
    customer: { name: string, phone: string | null } | null;
    booking_date: string;
    booking_time: string;
}

interface EditBookingModalProps {
  bookingGroup: BookingGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
}

const EditBookingModal = ({ bookingGroup, open, onOpenChange, onBookingUpdated }: EditBookingModalProps) => {
    const { timeSlotAvailability, loading: checkingAvailability, checkAllAvailability, lunchTimeSlots, dinnerTimeSlots } = useBooking();

    const [partySize, setPartySize] = useState(0);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        if (bookingGroup) {
            setPartySize(bookingGroup.total_party_size);
            setBookingDate(bookingGroup.booking_date);
            setBookingTime(bookingGroup.booking_time.substring(0, 5));
        }
    }, [bookingGroup]);
    
    // Re-check availability whenever the edit form details change
    useEffect(() => {
        if(open && bookingDate) {
            checkAllAvailability(bookingDate, partySize)
        }
    }, [open, bookingDate, partySize, checkAllAvailability]);


    const handleUpdate = async () => {
        if (!bookingGroup || !bookingGroup.customer) return;

        setLoadingUpdate(true);
        try {
            // Step 1: Find an available slot for the *new* party size and time
            const newSlot = timeSlotAvailability[bookingTime];
            if (!newSlot || !newSlot.available) {
                toast.error("No tables available for the updated booking details. Please try another time or party size.");
                setLoadingUpdate(false);
                return;
            }
            const newTableIds = newSlot.tables.map(t => t.id);

            // Step 2: Call the RPC function to handle the update
            const { error } = await supabase.rpc('update_booking_group', {
                p_group_id_to_cancel: bookingGroup.group_id,
                p_customer_name: bookingGroup.customer.name,
                p_customer_phone: bookingGroup.customer.phone,
                p_new_table_ids: newTableIds,
                p_new_party_size: partySize,
                p_booking_date: bookingDate,
                p_booking_time: bookingTime
            });

            if (error) throw error;
            toast.success("Booking updated successfully!");
            onBookingUpdated();
            onOpenChange(false);

        } catch (error: any) {
            toast.error(`Update failed: ${error.message}`);
        } finally {
            setLoadingUpdate(false);
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Booking</DialogTitle></DialogHeader>
        <div className="space-y-4">
            <div>
                <Label>Party Size</Label>
                <Input type="number" value={partySize} onChange={e => setPartySize(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <div>
                <Label>Date</Label>
                <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
            </div>
            <div>
                <Label>Time</Label>
                {checkingAvailability ? <div className="text-sm text-muted-foreground">Checking availability...</div> : (
                     <div className="grid grid-cols-4 gap-2">
                        {[...lunchTimeSlots, ...dinnerTimeSlots].map(time => (
                            <Button
                                key={time}
                                variant={bookingTime === time ? "default" : "outline"}
                                onClick={() => setBookingTime(time)}
                                disabled={!timeSlotAvailability[time]?.available && bookingTime !== time}
                            >
                                {time}
                            </Button>
                        ))}
                     </div>
                )}
            </div>
            <Button onClick={handleUpdate} disabled={loadingUpdate || checkingAvailability}>{loadingUpdate ? 'Updating...' : 'Save Changes'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingModal;