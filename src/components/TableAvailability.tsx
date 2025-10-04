import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type TableRowType = Database['public']['Tables']['restaurant_tables']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

interface TableAvailabilityProps {
    tables: TableRowType[];
    onTablesUpdate: () => void;
}

const TableAvailability = ({ tables, onTablesUpdate }: TableAvailabilityProps) => {
    const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);

    const fetchCurrentBookings = async () => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 8); // Use HH:MM:SS for better precision
        const currentDate = now.toISOString().slice(0, 10);
        const ninetyMinutesAgo = new Date(now.getTime() - 90 * 60000).toTimeString().slice(0, 8);

        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('booking_date', currentDate)
                .lte('booking_time', currentTime)
                .gte('booking_time', ninetyMinutesAgo);

            if (error) throw error;
            setCurrentBookings(data || []);
        } catch (error) {
            console.error('Error fetching current bookings:', error);
        }
    };

    useEffect(() => {
        fetchCurrentBookings();

        const channel = supabase
            .channel('realtime-bookings')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                    console.log('Change received!', payload);
                    // Refetch the bookings whenever a change occurs
                    fetchCurrentBookings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const bookedTableIds = useMemo(() => 
        new Set(currentBookings.map(b => b.table_id)), 
        [currentBookings]
    );
    
    const handleAvailabilityChange = async (
        tableId: string,
        newStatus: boolean
    ) => {
        try {
        const { error } = await supabase
            .from('restaurant_tables')
            .update({ is_available: newStatus })
            .eq('id', tableId);
        if (error) throw error;
        toast.success(`Table availability updated.`);
        onTablesUpdate();
        } catch (error) {
        console.error('Error updating table availability:', error);
        toast.error('Failed to update table availability.');
        }
    };

    if (!tables) {
        return <div>Loading table data...</div>;
    }

    return (
        <div className="space-y-4">
        <h2 className="text-xl font-bold">Real-Time Table Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tables.map((table) => {
                const isBooked = bookedTableIds.has(table.id);
                const isManuallyUnavailable = !table.is_available;
                
                return (
                    <div
                        key={table.id}
                        className={`p-4 border rounded-lg transition-colors ${
                            isBooked ? 'bg-red-500/10 border-red-500/20' 
                            : isManuallyUnavailable ? 'bg-yellow-500/10 border-yellow-500/20' 
                            : 'bg-green-500/10 border-green-500/20'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`table-${table.id}`} className="font-semibold">
                                Table {table.table_number}
                            </Label>
                            <Switch
                                id={`table-${table.id}`}
                                checked={table.is_available}
                                onCheckedChange={(newStatus) => handleAvailabilityChange(table.id, newStatus)}
                                disabled={isBooked}
                            />
                        </div>
                        <p className="text-sm mt-2">
                            {isBooked ? <span className="text-red-500 font-medium">Booked</span>
                            : isManuallyUnavailable ? <span className="text-yellow-500 font-medium">Unavailable</span>
                            : <span className="text-green-500 font-medium">Available</span>}
                        </p>
                    </div>
                );
            })}
        </div>
        </div>
    );
};

export default TableAvailability;