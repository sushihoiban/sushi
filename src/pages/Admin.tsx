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

const Admin = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading && bookings.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      <div className="mb-8">
        <AdminBooking onBookingCreated={fetchBookings} />
      </div>

      <div className="mb-8">
        <TableManager />
      </div>

      <div className="mb-8">
        <TableAvailability />
      </div>

      <h2 className="text-xl font-bold mb-4">All Bookings</h2>
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
    </div>
  );
};

export default Admin;