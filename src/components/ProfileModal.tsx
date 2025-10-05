import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MyReservationsModal from "./MyReservationsModal";
import LanguageSettingsModal from "./LanguageSettingsModal";
import ChangePhoneNumberModal from "./ChangePhoneNumberModal";
import PlaceholderModal from "./PlaceholderModal";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { user, isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const [showMyReservations, setShowMyReservations] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [showChangePhone, setShowChangePhone] = useState(false);
  const [placeholderModal, setPlaceholderModal] = useState<{ open: boolean, title: string }>({ open: false, title: "" });
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');

  useEffect(() => {
    const fetchContactNumber = async () => {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'restaurant_phone_number')
            .single();
        if (data?.value) {
            setContactPhoneNumber(data.value);
        }
    }
    fetchContactNumber();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out: " + error.message);
    } else {
      toast.success("You have been logged out.");
      navigate("/");
      onOpenChange(false);
    }
  };
  
  const goToAdmin = () => {
    navigate("/admin");
    onOpenChange(false);
  }

  const openPlaceholder = (title: string) => {
      setPlaceholderModal({ open: true, title });
  }

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-effect border-border/50 max-w-md">
            <DialogHeader>
            <DialogTitle className="text-2xl">Profile & Settings</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
            <Card className="glass-effect border-border/50 p-4">
                <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <i className="ri-user-line text-3xl text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">{user ? user.email : "Guest User"}</h3>
                    <p 
                        className={`text-sm text-muted-foreground ${user ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={() => user && setShowChangePhone(true)}
                    >
                        {profile?.phone || "No phone number"}
                    </p>
                </div>
                </div>
                {user && (
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <i className="ri-logout-box-r-line mr-2" />
                    Log Out
                </Button>
                )}
            </Card>

            <div className="space-y-2">
                {isAdmin && (
                    <><Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={goToAdmin}><i className="ri-settings-line text-xl" /><div className="text-left"><div className="font-medium">Admin Panel</div><div className="text-xs text-muted-foreground">Manage bookings and tables</div></div></Button><Separator /></>
                )}
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={() => setShowMyReservations(true)} disabled={!user}><i className="ri-bookmark-line text-xl" /><div className="text-left"><div className="font-medium">My Reservations</div><div className="text-xs text-muted-foreground">View your booking history</div></div></Button>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={() => openPlaceholder("Favorite Dishes")} disabled={!user}><i className="ri-heart-line text-xl" /><div className="text-left"><div className="font-medium">Favorite Dishes</div><div className="text-xs text-muted-foreground">Save your favorite items</div></div></Button>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={() => openPlaceholder("Notifications")} disabled={!user}><i className="ri-notification-line text-xl" /><div className="text-left"><div className="font-medium">Notifications</div><div className="text-xs text-muted-foreground">Manage your alerts</div></div></Button>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={() => setShowLanguageSettings(true)} disabled={!user}><i className="ri-global-line text-xl" /><div className="text-left"><div className="font-medium">Language</div><div className="text-xs text-muted-foreground">{profile?.language.toUpperCase() || 'EN'}</div></div></Button>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={() => openPlaceholder("Settings")} disabled={!user}><i className="ri-settings-line text-xl" /><div className="text-left"><div className="font-medium">Settings</div><div className="text-xs text-muted-foreground">App preferences</div></div></Button>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3" onClick={() => openPlaceholder("About")}><i className="ri-information-line text-xl" /><div className="text-left"><div className="font-medium">About</div><div className="text-xs text-muted-foreground">App version & info</div></div></Button>
            </div>

            <Card className="glass-effect border-border/50 p-4 space-y-2 text-sm">
                <p className="flex items-center gap-2"><i className="ri-map-pin-line text-primary" /><span>43 An Hải 20, Đà Nẵng</span></p>
                <p className="flex items-center gap-2"><i className="ri-phone-line text-primary" /><span>+{contactPhoneNumber}</span></p>
                <p className="flex items-center gap-2"><i className="ri-time-line text-primary" /><span>10:00 AM - 2:00 PM, 4:30 PM - 9:30 PM</span></p>
                <Separator className="my-3" />
                <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1 bg-green-500 hover:bg-green-600"><a href={`https://wa.me/${contactPhoneNumber}`} target="_blank" rel="noopener noreferrer"><i className="ri-whatsapp-line mr-2" /> WhatsApp</a></Button>
                    <Button asChild size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600"><a href={`https://zalo.me/${contactPhoneNumber}`} target="_blank" rel="noopener noreferrer"><i className="ri-message-2-line mr-2" /> Zalo</a></Button>
                </div>
            </Card>
            </div>
        </DialogContent>
        </Dialog>
        {user && <MyReservationsModal open={showMyReservations} onOpenChange={setShowMyReservations} />}
        {user && <LanguageSettingsModal open={showLanguageSettings} onOpenChange={setShowLanguageSettings} />}
        {user && <ChangePhoneNumberModal open={showChangePhone} onOpenChange={setShowChangePhone} />}
        <PlaceholderModal open={placeholderModal.open} onOpenChange={(isOpen) => setPlaceholderModal({ ...placeholderModal, open: isOpen })} title={placeholderModal.title} />
    </>
  );
};

export default ProfileModal;