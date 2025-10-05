import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminSettingsPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'restaurant_phone_number')
                    .single();
                
                if (error) throw error;
                setPhoneNumber(data.value || '');
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('app_settings')
                .update({ value: phoneNumber })
                .eq('key', 'restaurant_phone_number');
            if (error) throw error;
            toast.success("Settings saved successfully.");
        } catch (error: any) {
            toast.error(`Failed to save settings: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div>Loading settings...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Application Settings</h1>
            <div className="max-w-md space-y-4">
                <div>
                    <Label htmlFor="phone-number">Restaurant Contact Phone</Label>
                    <Input 
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g., 84123456789"
                    />
                    <p className="text-sm text-muted-foreground mt-1">This number is used for the WhatsApp and Zalo chat links.</p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
};

export default AdminSettingsPage;