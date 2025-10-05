import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface ChangePhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePhoneNumberModal = ({ open, onOpenChange }: ChangePhoneNumberModalProps) => {
    const { profile } = useAuth();
    const [phone, setPhone] = useState(profile?.phone || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            // Step 1: Update the auth user's phone
            const { error: authError } = await supabase.auth.updateUser({ phone: phone });
            if (authError) throw authError;

            // Step 2: Update the public profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ phone: phone })
                .eq('id', profile!.id);
            if (profileError) throw profileError;

            toast.success("Phone number updated successfully.");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(`Update failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Change Phone Number</DialogTitle></DialogHeader>
        <div className="py-4">
            <Input 
                type="tel" 
                placeholder="Enter new phone number" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
            />
        </div>
        <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePhoneNumberModal;