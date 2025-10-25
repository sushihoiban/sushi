import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/hooks/use-booking";
import { Database } from "@/integrations/supabase/types";
import { format, addMinutes, parse } from 'date-fns';
import { useAdminState } from "@/hooks/use-admin-state";

type Customer = Database['public']['Tables']['customers']['Row'];

// Helper to format date to YYYY-MM-DD in local timezone
const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AdminBookingForm = () => {
  const { timeSlotAvailability, loading, checkAllAvailability, lunchTimeSlots, dinnerTimeSlots } = useBooking();
  const { refetchBookings } = useAdminState();
  
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loadingBooking, setLoadingBooking] = useState(false);

  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSelectedDate(toLocalDateString(new Date()));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      checkAllAvailability(selectedDate, partySize);
    }
  }, [selectedDate, partySize, checkAllAvailability]);

  useEffect(() => {
    const fetchSuggestions = async () => {
        if (customerName.length > 1) {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .ilike('name', `%${customerName}%`)
                .limit(5);
            if (error) console.error(error);
            else setSuggestions(data || []);
        } else {
            setSuggestions([]);
        }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [customerName]);

  const bookingEndTime = useMemo(() => {
    if (!selectedTime) return null;
    const startTime = parse(selectedTime, 'HH:mm', new Date());
    const endTime = addMinutes(startTime, 90);
    return format(endTime, 'HH:mm');
  }, [selectedTime]);

  const handleSuggestionClick = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone || '');
    setShowSuggestions(false);
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedTime || !selectedDate) {
        toast.error('Please fill out all fields.');
        return;
    }
    setLoadingBooking(true);
    try {
        const selectedSlot = timeSlotAvailability[selectedTime];
        if (!selectedSlot || !selectedSlot.available) {
            toast.error("The selected time is no longer available.");
            return;
        }
        const tableIds = selectedSlot.tables.map(t => t.id);
        const { error } = await supabase.rpc('create_booking_for_party', {
            p_customer_name: customerName,
            p_customer_phone: customerPhone,
            p_table_ids: tableIds,
            p_party_size: partySize,
            p_booking_date: selectedDate,
            p_booking_time: selectedTime,
        });
        if (error) throw error;
        toast.success("Booking created successfully!");
        refetchBookings();
        setCustomerName('');
        setCustomerPhone('');
        setSelectedTime(null);
        checkAllAvailability(selectedDate, partySize);
    } catch(error: any) {
        toast.error(`Booking failed: ${error.message}`);
    } finally {
        setLoadingBooking(false);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { date: toLocalDateString(d), dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: d.getDate() };
  });

  return (
    <form onSubmit={handleBooking} className="space-y-6 max-w-2xl mx-auto p-6 bg-secondary rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-3">Party Size</label>
        <div className="flex items-center justify-center gap-4 p-4 bg-background rounded-lg">
          <Button type="button" variant="outline" size="icon" onClick={() => setPartySize(Math.max(1, partySize - 1))} className="h-12 w-12 rounded-full">
            <i className="ri-subtract-line text-xl" />
          </Button>
          <span className="text-3xl font-bold w-16 text-center">{partySize}</span>
          <Button type="button" variant="default" size="icon" onClick={() => setPartySize(partySize + 1)} className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90">
            <i className="ri-add-line text-xl" />
          </Button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-3">Select Date</label>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((d) => (
            <button key={d.date} type="button" onClick={() => setSelectedDate(d.date)} className={`p-3 rounded-lg text-center transition-colors ${selectedDate === d.date ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
              <div className="text-xs">{d.dayName}</div>
              <div className="font-semibold">{d.dayNum}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-3">Select Time</label>
        {loading ? <div className="text-center p-4">Loading...</div> : (
          <>
            <p className="text-xs text-muted-foreground mb-2">Lunch</p>
            <div className="grid grid-cols-4 gap-2 mb-4">{lunchTimeSlots.map(time => <button key={time} type="button" disabled={!timeSlotAvailability[time]?.available} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-background'} disabled:opacity-50`}>{time}</button>)}</div>
            <p className="text-xs text-muted-foreground mb-2">Dinner</p>
            <div className="grid grid-cols-4 gap-2">{dinnerTimeSlots.map(time => <button key={time} type="button" disabled={!timeSlotAvailability[time]?.available} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'bg-background'} disabled:opacity-50`}>{time}</button>)}</div>
          </>
        )}
      </div>

      {selectedTime && bookingEndTime && (
        <div className="text-center p-4 bg-background rounded-lg">
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

      <div className="grid grid-cols-2 gap-4 relative">
        <div>
            <Input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => { setCustomerName(e.target.value); setShowSuggestions(true); }} required />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-background border mt-1 rounded-md shadow-lg">
                    {suggestions.map(customer => (
                        <div key={customer.id} onClick={() => handleSuggestionClick(customer)} className="p-2 hover:bg-muted cursor-pointer">
                            {customer.name} - {customer.phone}
                        </div>
                    ))}
                </div>
            )}
        </div>
        <Input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loadingBooking || !selectedTime} className="flex-1">{loadingBooking ? 'Processing...' : 'Confirm Reservation'}</Button>
      </div>
    </form>
  );
};