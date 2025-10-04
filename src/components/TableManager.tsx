import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

type TableRowType = Database['public']['Tables']['restaurant_tables']['Row'];

interface TableManagerProps {
    tables: TableRowType[];
    onTablesUpdate: () => void;
}

const TableManager = ({ tables, onTablesUpdate }: TableManagerProps) => {
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('');
  const [editingSeats, setEditingSeats] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Sync editingSeats state when the tables prop changes
    const seatsState: { [key: string]: number } = {};
    tables.forEach(table => {
        seatsState[table.id] = table.seats;
    });
    setEditingSeats(seatsState);
  }, [tables]);

  const handleAddTable = async () => {
    if (!newTableNumber || !newTableSeats) {
      toast.error('Please enter a table number and number of seats.');
      return;
    }
    try {
      const { error } = await supabase.from('restaurant_tables').insert({
        table_number: parseInt(newTableNumber, 10),
        seats: parseInt(newTableSeats, 10),
      });
      if (error) throw error;
      setNewTableNumber('');
      setNewTableSeats('');
      toast.success('Table added successfully!');
      onTablesUpdate(); // Trigger refetch in parent
    } catch (error) {
      console.error('Error adding table:', error);
      toast.error('Failed to add table.');
    }
  };

  const handleUpdateSeats = async (tableId: string) => {
    const seats = editingSeats[tableId];
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ seats })
        .eq('id', tableId);
      if (error) throw error;
      toast.success('Table updated successfully!');
      onTablesUpdate();
    } catch (error) {
      console.error('Error updating table seats:', error);
      toast.error('Failed to update table.');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table? This might affect existing bookings.')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('restaurant_tables')
            .delete()
            .eq('id', tableId);
        if (error) throw error;
        toast.success('Table deleted successfully!');
        onTablesUpdate();
    } catch (error) {
        console.error('Error deleting table:', error);
        toast.error(`Error: ${error.message}`);
    }
  }

  const handleSeatChange = (tableId: string, seats: string) => {
    setEditingSeats(prev => ({
        ...prev,
        [tableId]: parseInt(seats, 10) || 0,
    }));
  };

  return (
    <div>
        <h2 className="text-xl font-bold mb-4">Manage Tables</h2>
        <div className="flex gap-4 mb-4 p-4 border rounded-lg">
            <div className="flex-1">
                <Label htmlFor="new-table-number">Table Number</Label>
                <Input
                id="new-table-number"
                type="number"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="e.g., 10"
                />
            </div>
            <div className="flex-1">
                <Label htmlFor="new-table-seats">Number of Seats</Label>
                <Input
                id="new-table-seats"
                type="number"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(e.target.value)}
                placeholder="e.g., 4"
                />
            </div>
            <div className="flex items-end">
                <Button onClick={handleAddTable}>Add Table</Button>
            </div>
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Table Number</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tables.map((table) => (
                    <TableRow key={table.id}>
                        <TableCell>{table.table_number}</TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                value={editingSeats[table.id] ?? ''}
                                onChange={(e) => handleSeatChange(table.id, e.target.value)}
                                className="w-24"
                            />
                        </TableCell>
                        <TableCell className="space-x-2">
                            <Button size="sm" onClick={() => handleUpdateSeats(table.id)}>Update</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteTable(table.id)}>Delete</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
};

export default TableManager;