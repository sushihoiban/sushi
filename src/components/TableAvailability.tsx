import { supabase } from '../integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type TableRowType = Database['public']['Tables']['restaurant_tables']['Row'];

interface TableAvailabilityProps {
    tables: TableRowType[];
    onTablesUpdate: () => void;
}

const TableAvailability = ({ tables, onTablesUpdate }: TableAvailabilityProps) => {
    
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