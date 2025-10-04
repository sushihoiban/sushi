import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import TableManager from "@/components/TableManager";

type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row'];

const AdminTablesPage = () => {
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTables = useCallback(async () => {
        setLoading(true);
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
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    if(loading) return <div>Loading tables...</div>

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Manage Tables</h1>
            <p className="text-muted-foreground mb-6">Add, edit, or remove restaurant tables.</p>
            <TableManager tables={tables} onTablesUpdate={fetchTables}/>
        </div>
    );
}
export default AdminTablesPage;