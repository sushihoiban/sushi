import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import TableAvailability from '@/components/TableAvailability';
import TableManager from '@/components/TableManager';
import AdminBooking from '@/components/AdminBooking';
import { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    restaurant_tables: Database['public']['Tables']['restaurant_tables']['Row'];
    customers: Database['public']['Tables']['customers']['Row'];
};
type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row'];


const Admin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, restaurant_tables(*), customers(*)')
        .order('booking_date', { ascending: false }); 
      if (error) throw error;
      setBookings(data as Booking[] || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchTables = useCallback(async () => {
    setLoadingTables(true);
    try {
        const { data, error } = await supabase
            .from('restaurant_tables')
            .select('*')
            .order('table_number', { ascending: true });
        if (error) throw error;
        setTables(data || []);
    } catch (error) {
        console.error('Error fetching tables:', error);
    } finally {
        setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchTables();
  }, [fetchBookings, fetchTables]);

  const isLoading = loadingBookings || loadingTables;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      <div className="mb-8">
        <AdminBooking onBookingCreated={fetchBookings} />
      </div>

      <div className="mb-8">
        <TableManager tables={tables} onTablesUpdate={fetchTables} />
      </div>

      <div className="mb-8">
        <TableAvailability tables={tables} onTablesUpdate={fetchTables} />
      </div>

      <h2 className="text-xl font-bold mb-4">All Bookings</h2>
      {isLoading ? (
        <div>Loading bookings...</div>
      ) : (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Party Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {bookings.map((booking) => (
                <TableRow key={booking.id}>
                <TableCell>{booking.restaurant_tables ? booking.restaurant_tables.table_number : 'N/A'}</TableCell>
                <TableCell>{booking.customers ? booking.customers.name : 'N/A'}</TableCell>
                <TableCell>{booking.customers ? booking.customers.phone : 'N/A'}</TableCell>
                <TableCell>{booking.party_size}</TableCell>
                <TableCell>{booking.booking_date}</TableCell>
                <TableCell>{booking.booking_time}</TableCell>
                <TableCell>
                    <Button variant="destructive" size="sm">
                    Cancel
                    </Button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Admin;