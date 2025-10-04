import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingModal = ({ open, onOpenChange }: BookingModalProps) => {
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  const [timeSlotAvailability, setTimeSlotAvailability] = useState<Record<string, boolean>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const lunchTimeSlots = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00"];
  const dinnerTimeSlots = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
  const allTimeSlots = [...lunchTimeSlots, ...dinnerTimeSlots];

  const checkAllAvailability = useCallback(async () => {
    if (!selectedDate || !open) return;

    setLoadingAvailability(true);
    const availability: Record<string, boolean> = {};

    for (const time of allTimeSlots) {
        try {
            const { data, error } = await supabase.rpc('get_available_tables', {
                p_booking_date: selectedDate,
                p_booking_time: time,
                p_party_size: partySize,
            });

            if (error) throw error;
            availability[time] = data && data.length > 0;
        } catch (error) {
            console.error(`Error checking availability for ${time}:`, error);
            availability[time] = false; // Assume unavailable on error
        }
    }
    
    setTimeSlotAvailability(availability);
    setLoadingAvailability(false);
  }, [selectedDate, partySize, open]);

  useEffect(() => {
    // Set default date to today when modal opens
    if (open && !selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
    // Reset state when modal is closed
    if (!open) {
        setSelectedTime(null);
        setTimeSlotAvailability({});
    }
  }, [open, selectedDate]);

  useEffect(() => {
    checkAllAvailability();
  }, [checkAllAvailability]);
  

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone) {
      toast.error('Please fill in your contact information');
      return;
    }
    if (!selectedTime || !selectedDate) {
        toast.error('Please select a date and time');
        return;
    }

    setLoadingBooking(true);
    try {
      // Re-fetch available tables for the selected slot to get the best fit
      const { data: tables, error: tablesError } = await supabase.rpc('get_available_tables', {
        p_booking_date: selectedDate,
        p_booking_time: selectedTime,
        p_party_size: partySize,
      });

      if (tablesError || !tables || tables.length === 0) {
        toast.error('Sorry, the selected time slot is no longer available. Please choose another time.');
        checkAllAvailability(); // Refresh availability
        setLoadingBooking(false);
        return;
      }
      
      const tableToBook = tables[0]; // The function returns them sorted by seats, so this is the best fit

      const { error: bookingError } = await supabase.rpc('create_booking_with_customer', {
        p_customer_name: customerName,
        p_customer_phone: customerPhone,
        p_table_id: tableToBook.id,
        p_party_size: partySize,
        p_booking_date: selectedDate,
        p_booking_time: selectedTime,
      });

      if (bookingError) throw bookingError;

      toast.success(`Table ${tableToBook.table_number} reserved successfully! We look forward to serving you.`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoadingBooking(false);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate()
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-border/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reserve a Table</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleBooking} className="space-y-6">
          {/* Party Size */}
          <div>
            <label className="block text-sm font-medium mb-3">Party Size</label>
            <div className="flex items-center justify-center gap-4 p-4 bg-secondary rounded-lg">
              <Button type="button" variant="outline" size="icon" onClick={() => setPartySize(Math.max(1, partySize - 1))} className="h-12 w-12 rounded-full">
                <i className="ri-subtract-line text-xl" />
              </Button>
              <span className="text-3xl font-bold w-16 text-center">{partySize}</span>
              <Button type="button" variant="default" size="icon" onClick={() => setPartySize(Math.min(20, partySize + 1))} className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90">
                <i className="ri-add-line text-xl" />
              </Button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Date</label>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className={`p-3 rounded-lg text-center transition-colors ${selectedDate === d.date ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                >
                  <div className="text-xs">{d.dayName}</div>
                  <div className="font-semibold">{d.dayNum}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Time</label>
            {loadingAvailability ? (
              <div className="text-center p-4">
                <i className="ri-loader-4-line mr-2 animate-spin" /> Checking available times...
              </div>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground mb-2">Lunch</p>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {lunchTimeSlots.map((time) => (
                        <button
                            key={time}
                            type="button"
                            disabled={!timeSlotAvailability[time]}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                        >
                            {time}
                        </button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Dinner</p>
                    <div className="grid grid-cols-4 gap-2">
                        {dinnerTimeSlots.map((time) => (
                        <button
                            key={time}
                            type="button"
                            disabled={!timeSlotAvailability[time]}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                        >
                            {time}
                        </button>
                        ))}
                    </div>
                </>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="bg-secondary border-border" />
            <Input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required className="bg-secondary border-border" />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loadingBooking || !selectedTime} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {loadingBooking ? 'Processing...' : 'Confirm Reservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;