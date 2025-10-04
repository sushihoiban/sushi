import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';

type Booking = Database['public']['Tables']['bookings']['Row'] & { customers: Database['public']['Tables']['customers']['Row'] | null };
type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row'];

const AvailabilityChecker = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: tablesData, error: tablesError } = await supabase
                    .from('restaurant_tables')
                    .select('*')
                    .order('table_number');
                if (tablesError) throw tablesError;
                setTables(tablesData || []);

                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*, customers(name)')
                    .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'));
                if (bookingsError) throw bookingsError;
                setBookings(bookingsData as Booking[] || []);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDate]);

    const allTimeSlots = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

    const getBookingForSlot = (tableId: string, timeSlot: string): Booking | null => {
        const slotTime = parse(timeSlot, 'HH:mm', selectedDate);
        for (const booking of bookings) {
            if (booking.table_id === tableId) {
                const bookingStartTime = parse(booking.booking_time, 'HH:mm:ss', selectedDate);
                const bookingEndTime = new Date(bookingStartTime.getTime() + 90 * 60000);
                if (slotTime >= bookingStartTime && slotTime < bookingEndTime) {
                    return booking;
                }
            }
        }
        return null;
    };
    
    const isBookingStart = (booking: Booking, timeSlot: string) => {
        return booking.booking_time.substring(0, 5) === timeSlot;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-64 justify-start text-left font-normal">
                            <i className="ri-calendar-line mr-2" />
                            {format(selectedDate, 'PPP')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={selectedDate} onSelect={(date) => setSelectedDate(date || new Date())} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
            
            {loading ? <div>Loading availability...</div> : (
                <div className="overflow-x-auto bg-background rounded-lg border">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-background z-10">
                            <tr className="bg-muted">
                                <th className="p-2 border font-semibold text-sm">Table</th>
                                {allTimeSlots.map(time => (
                                    <>
                                        <th key={time} className="p-2 border text-sm">{time}</th>
                                        {time === "14:00" && <th className="bg-secondary w-4"></th>}
                                    </>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map(table => (
                                <tr key={table.id}>
                                    <td className="p-2 border font-semibold text-sm">T{table.table_number} ({table.seats}s)</td>
                                    {allTimeSlots.map(time => {
                                        const booking = getBookingForSlot(table.id, time);
                                        const isStart = booking ? isBookingStart(booking, time) : false;
                                        const customerName = booking?.customers?.name?.split(' ')[0] || '';
                                        
                                        const cellClass = `p-2 border text-center text-xs h-12 ${!booking ? 'bg-green-500/10' : ''}`;
                                        const borderClass = isStart ? 'border-l-4 border-l-primary' : 'border-l-0';

                                        if (time === "14:00") {
                                             return <>
                                                <td className={`${cellClass} ${borderClass} ${booking ? 'bg-red-500/20' : ''}`}>
                                                    {isStart && <span className="font-semibold">{customerName}</span>}
                                                </td>
                                                <td className="bg-secondary w-4"></td>
                                            </>
                                        }

                                        return (
                                            <td className={`${cellClass} ${borderClass} ${booking ? 'bg-red-500/20' : ''}`}>
                                                {isStart && <span className="font-semibold">{customerName}</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AvailabilityChecker;