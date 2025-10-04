import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Booking = Database['public']['Tables']['bookings']['Row'] & { customers: Database['public']['Tables']['customers']['Row'] | null, restaurant_tables: Database['public']['Tables']['restaurant_tables']['Row'] | null };
type Customer = Database['public']['Tables']['customers']['Row'];
type Table = Database['public']['Tables']['restaurant_tables']['Row'];

interface EditBookingModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
}

const EditBookingModal = ({ booking, open, onOpenChange, onBookingUpdated }: EditBookingModalProps) => {
    const [partySize, setPartySize] = useState(0);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [selectedTableId, setSelectedTableId] = useState("");
    const [loading, setLoading] = useState(false);
    const [allTables, setAllTables] = useState<Table[]>([]);

    useEffect(() => {
        const fetchTables = async () => {
            const { data } = await supabase.from('restaurant_tables').select('*');
            setAllTables(data || []);
        }
        fetchTables();
    }, []);

    useEffect(() => {
        if (booking) {
            setPartySize(booking.party_size);
            setBookingDate(booking.booking_date);
            setBookingTime(booking.booking_time.substring(0,5));
            setSelectedTableId(booking.table_id);
        }
    }, [booking]);

    const handleUpdate = async () => {
        if (!booking) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({
                    party_size: partySize,
                    booking_date: bookingDate,
                    booking_time: bookingTime,
                    table_id: selectedTableId
                })
                .eq('id', booking.id);

            if (error) throw error;
            toast.success("Booking updated successfully!");
            onBookingUpdated();
            onOpenChange(false);

        } catch (error: any) {
            toast.error(`Update failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const timeSlots = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Booking</DialogTitle></DialogHeader>
        <div className="space-y-4">
            <div>
                <Label>Party Size</Label>
                <Input type="number" value={partySize} onChange={e => setPartySize(parseInt(e.target.value) || 0)} />
            </div>
            <div>
                <Label>Date</Label>
                <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
            </div>
            <div>
                <Label>Time</Label>
                <Select value={bookingTime} onValueChange={setBookingTime}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
            </div>
             <div>
                <Label>Table</Label>
                <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{allTables.map(t => <SelectItem key={t.id} value={t.id}>T{t.table_number} ({t.seats} seats)</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <Button onClick={handleUpdate} disabled={loading}>{loading ? 'Updating...' : 'Save Changes'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingModal;