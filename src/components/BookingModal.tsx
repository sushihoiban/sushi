import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useBooking } from "@/hooks/use-booking";
import { format, addMinutes, parse } from 'date-fns';
import ConfirmCustomerCreationModal from "./ConfirmCustomerCreationModal";

// Helper to format date to YYYY-MM-DD in local timezone
const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingModal = ({ open, onOpenChange }: BookingModalProps) => {
  const { profile, user } = useAuth();
  const { timeSlotAvailability, loading, checkAllAvailability, lunchTimeSlots, dinnerTimeSlots } = useBooking();

  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (open && profile) {
        setCustomerName(profile.full_name || "");
        setCustomerPhone(profile.phone || "");
    }
  }, [open, profile]);

  useEffect(() => {
    if (open && !selectedDate) {
      setSelectedDate(toLocalDateString(new Date()));
    }
    if(selectedDate && open) {
        checkAllAvailability(selectedDate, partySize);
    }
    if (!open) {
        setSelectedTime(null);
    }
  }, [open, selectedDate, partySize, checkAllAvailability]);
  
  const bookingEndTime = useMemo(() => {
    if (!selectedTime) return null;
    const startTime = parse(selectedTime, 'HH:mm', new Date());
    const endTime = addMinutes(startTime, 90);
    return format(endTime, 'HH:mm');
  }, [selectedTime]);

  const proceedWithBooking = async (shouldCreateCustomer: boolean) => {
    if (!selectedTime) return; // Should not happen, but for type safety
    setLoadingBooking(true);
    try {
        const selectedSlot = timeSlotAvailability[selectedTime];
        if (!selectedSlot || !selectedSlot.available) {
            toast.error("The selected time is no longer available.");
            setLoadingBooking(false);
            return;
        }

        const tableIds = selectedSlot.tables.map(t => t.id);

        const { error } = await supabase.rpc('create_booking_with_customer', {
            p_customer_name: customerName,
            p_customer_phone: customerPhone,
            p_table_ids: tableIds,
            p_party_size: partySize,
            p_booking_date: selectedDate,
            p_booking_time: selectedTime,
            p_user_id: user?.id,
            p_create_customer: shouldCreateCustomer,
        });

      if (error) throw error;
      toast.success(`Reservation confirmed successfully!`);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(`Booking failed: ${error.message}`);
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedTime || !selectedDate) {
      toast.error('Please fill in all fields.');
      return;
    }

    const { data: customerExists, error } = await supabase.rpc('check_customer_exists', { p_phone_number: customerPhone });
    if(error) {
        toast.error("Could not verify customer. Please try again.");
        return;
    }

    if (customerExists) {
        await proceedWithBooking(false);
    } else {
        setShowConfirmModal(true);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { date: toLocalDateString(d), dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: d.getDate() };
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-effect border-border/50 max-w-2xl">
          <DialogHeader><DialogTitle className="text-2xl">Reserve a Table</DialogTitle></DialogHeader>
          <form onSubmit={handleBooking} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Party Size</label>
              <div className="flex items-center justify-center gap-4 p-4 bg-secondary rounded-lg">
                <Button type="button" variant="outline" size="icon" onClick={() => setPartySize(Math.max(1, partySize - 1))} className="h-12 w-12 rounded-full"><i className="ri-subtract-line text-xl" /></Button>
                <span className="text-3xl font-bold w-16 text-center">{partySize}</span>
                <Button type="button" variant="default" size="icon" onClick={() => setPartySize(partySize + 1)} className="h-12 w-12 rounded-full"><i className="ri-add-line text-xl" /></Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Select Date</label>
              <div className="grid grid-cols-7 gap-2">{dates.map(d => <button key={d.date} type="button" onClick={() => setSelectedDate(d.date)} className={`p-3 rounded-lg text-center transition-colors ${selectedDate === d.date ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}><div className="text-xs">{d.dayName}</div><div className="font-semibold">{d.dayNum}</div></button>)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Select Time</label>
              {loading ? <div className="text-center p-4"><i className="ri-loader-4-line mr-2 animate-spin" /> Checking...</div> : (
                <>
                  <p className="text-xs text-muted-foreground mb-2">Lunch</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">{lunchTimeSlots.map(time => <button key={time} type="button" disabled={!timeSlotAvailability[time]?.available} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-secondary'} disabled:opacity-50`}>{time}</button>)}</div>
                  <p className="text-xs text-muted-foreground mb-2">Dinner</p>
                  <div className="grid grid-cols-4 gap-2">{dinnerTimeSlots.map(time => <button key={time} type="button" disabled={!timeSlotAvailability[time]?.available} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-secondary'} disabled:opacity-50`}>{time}</button>)}</div>
                </>
              )}
            </div>

            {selectedTime && bookingEndTime && (
              <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Booking Time</p>
                  <div className="flex items-end justify-center gap-4">
                      <div className="text-center">
                          <p className="text-xs text-muted-foreground">Starts</p>
                          <p className="text-2xl font-bold text-primary">{selectedTime}</p>
                      </div>
                      <div>
                          <i className="ri-arrow-right-line text-2xl text-muted-foreground"></i>
                      </div>
                      <div className="text-center">
                          <p className="text-xs text-muted-foreground">Ends</p>
                          <p className="text-2xl font-bold text-primary">{bookingEndTime}</p>
                      </div>
                  </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input type="text" placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              <Input type="tel" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loadingBooking || !selectedTime} className="flex-1">{loadingBooking ? 'Processing...' : 'Confirm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmCustomerCreationModal
        open={showConfirmModal}
        customerName={customerName}
        onConfirm={async () => {
            setShowConfirmModal(false);
            await proceedWithBooking(true);
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

export default BookingModal;