import { useState, useEffect } from "react";
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
  const [selectedTime, setSelectedTime] = useState<string>("18:00");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

  useEffect(() => {
    if (open && selectedDate && selectedTime) {
      checkAvailability();
    }
  }, [open, selectedDate, selectedTime, partySize]);

  const checkAvailability = async () => {
    setLoading(true);
    try {
      // Get all tables
      const { data: tables, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .gte('seats', partySize)
        .order('seats');

      if (tablesError) throw tablesError;

      // Get existing bookings for the selected date and time
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('table_id')
        .eq('booking_date', selectedDate)
        .eq('booking_time', selectedTime);

      if (bookingsError) throw bookingsError;

      const bookedTableIds = bookings?.map(b => b.table_id) || [];
      const available = tables?.filter(t => !bookedTableIds.includes(t.id)) || [];
      
      setAvailableTables(available);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone) {
      toast.error('Please fill in your contact information');
      return;
    }

    if (availableTables.length === 0) {
      toast.error('No tables available for this time');
      return;
    }

    setLoading(true);
    try {
      // Book the first available table that fits
      const tableToBook = availableTables[0];
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          table_id: tableToBook.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          party_size: partySize,
          booking_date: selectedDate || dates[0].date,
          booking_time: selectedTime
        });

      if (error) throw error;

      toast.success(`Table ${tableToBook.table_number} reserved successfully! We look forward to serving you.`);
      setCustomerName("");
      setCustomerPhone("");
      setPartySize(2);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate next 7 days
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
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="h-12 w-12 rounded-full"
              >
                <i className="ri-subtract-line text-xl" />
              </Button>
              <span className="text-3xl font-bold w-16 text-center">{partySize}</span>
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={() => setPartySize(Math.min(20, partySize + 1))}
                className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
              >
                <i className="ri-add-line text-xl" />
              </Button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Date</label>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((d, index) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedDate === d.date || (index === 0 && !selectedDate)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
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
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedTime === time
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Your Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="bg-secondary border-border"
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>

          {/* Availability Info */}
          {selectedDate && selectedTime && (
            <div className={`p-4 rounded-lg text-sm ${availableTables.length > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {loading ? (
                <p><i className="ri-loader-4-line mr-2 animate-spin" />Checking availability...</p>
              ) : availableTables.length > 0 ? (
                <p><i className="ri-checkbox-circle-line mr-2 text-green-500" />{availableTables.length} table(s) available for {partySize} guest(s)</p>
              ) : (
                <p><i className="ri-close-circle-line mr-2 text-red-500" />No tables available for this time. Please select another time.</p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-secondary p-4 rounded-lg text-sm text-muted-foreground space-y-2">
            <p><i className="ri-map-pin-line mr-2 text-primary" />Location: 43 An Hải 20, Đà Nẵng</p>
            <p><i className="ri-information-line mr-2 text-primary" />Reservation confirmation will be sent via SMS</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || availableTables.length === 0}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
