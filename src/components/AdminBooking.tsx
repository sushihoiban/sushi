import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
  } from '@/components/ui/dialog';

type Table = Database['public']['Tables']['restaurant_tables']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];

interface AdminBookingProps {
  onBookingCreated: () => void;
}

const AdminBooking = ({ onBookingCreated }: AdminBookingProps) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  // Form state
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [partySize, setPartySize] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  
  // New customer state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerStatus, setNewCustomerStatus] = useState<'regular' | 'vip'>('regular');


  const fetchInitialData = async () => {
    try {
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number', { ascending: true });
      if (tablesError) throw tablesError;
      setTables(tablesData || []);

      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('status', { ascending: false }); // VIPs first
      if (customersError) throw customersError;
      setCustomers(customersData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateCustomer = async () => {
    if (!newCustomerName) {
        toast.error("Customer name is required.");
        return;
    }
    try {
        const { data, error } = await supabase.from('customers').insert({
            name: newCustomerName,
            phone: newCustomerPhone,
            status: newCustomerStatus,
        }).select();

        if (error) throw error;
        
        toast.success("Customer created successfully!");
        setShowNewCustomerDialog(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerStatus('regular');
        fetchInitialData(); // Refresh customer list
        if (data && data.length > 0) {
            setSelectedCustomerId(data[0].id); // Auto-select the new customer
        }
    } catch (error) {
        console.error('Error creating customer:', error);
        toast.error('Failed to create customer.');
    }
  }

  const handleSubmit = async () => {
    if (!selectedTableId || !selectedCustomerId || !partySize || !bookingDate || !bookingTime) {
      toast.error('Please fill out all fields to create a booking.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        table_id: selectedTableId,
        customer_id: selectedCustomerId,
        party_size: parseInt(partySize, 10),
        booking_date: bookingDate,
        booking_time: bookingTime,
      });

      if (error) throw error;

      toast.success('Booking created successfully!');
      // Reset form
      setSelectedTableId('');
      setSelectedCustomerId('');
      setPartySize('');
      setBookingDate('');
      setBookingTime('');
      onBookingCreated();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bookingTimes = Array.from({ length: 11 }, (_, i) => {
    const hour = 17 + Math.floor((i * 30) / 60);
    const minute = (i * 30) % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Create a New Booking</h2>
      <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3 flex justify-between items-end">
            <div className="flex-1">
                <Label htmlFor="customer-select">Customer</Label>
                <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                    <SelectTrigger id="customer-select">
                    <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                    {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.status === 'vip' ? ' (VIP)' : ''}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="ml-2">Create New Customer</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="new-customer-name">Name</Label>
                            <Input id="new-customer-name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="new-customer-phone">Phone</Label>
                            <Input id="new-customer-phone" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="new-customer-status">Status</Label>
                            <Select onValueChange={(value: 'regular' | 'vip') => setNewCustomerStatus(value)} defaultValue="regular">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="regular">Regular</SelectItem>
                                    <SelectItem value="vip">VIP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowNewCustomerDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateCustomer}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div>
            <Label htmlFor="party-size">Party Size</Label>
            <Input id="party-size" type="number" value={partySize} onChange={(e) => setPartySize(e.target.value)} />
        </div>
        <div>
            <Label htmlFor="booking-date">Date</Label>
            <Input id="booking-date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="booking-time">Time</Label>
          <Select onValueChange={setBookingTime} value={bookingTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {bookingTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="table-select">Table</Label>
          <Select onValueChange={setSelectedTableId} value={selectedTableId}>
            <SelectTrigger id="table-select">
              <SelectValue placeholder="Select a table" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  Table {table.table_number} (Seats: {table.seats})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? 'Booking...' : 'Create Booking'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminBooking;