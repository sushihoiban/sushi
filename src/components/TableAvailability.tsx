import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Database } from '@/integrations/supabase/types';

type Table = Database['public']['Tables']['restaurant_tables']['Row'];

const TableAvailability = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('*');
        if (error) throw error;
        setTables(data || []);
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

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
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === tableId ? { ...table, is_available: newStatus } : table
        )
      );
    } catch (error) {
      console.error('Error updating table availability:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Table Availability</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="flex items-center space-x-2 p-4 border rounded-lg"
          >
            <Switch
              id={`table-${table.id}`}
              checked={table.is_available}
              onCheckedChange={(newStatus) =>
                handleAvailabilityChange(table.id, newStatus)
              }
            />
            <Label htmlFor={`table-${table.id}`}>
              Table {table.table_number}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableAvailability;