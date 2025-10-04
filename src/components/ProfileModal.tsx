import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Profile & Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Section */}
          <Card className="glass-effect border-border/50 p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="ri-user-line text-3xl text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{user ? user.email : "Guest User"}</h3>
                <p className="text-sm text-muted-foreground">{user ? "Welcome back!" : "Welcome to our restaurant"}</p>
              </div>
            </div>
            {user && (
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <i className="ri-logout-box-r-line mr-2" />
                Log Out
              </Button>
            )}
          </Card>

          {/* Settings Options */}
          <div className="space-y-2">
            {isAdmin && (
                <>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={goToAdmin}
                >
                    <i className="ri-settings-line text-xl" />
                    <div className="text-left">
                    <div className="font-medium">Admin Panel</div>
                    <div className="text-xs text-muted-foreground">Manage bookings and tables</div>
                    </div>
                </Button>
                <Separator />
                </>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
            >
              <i className="ri-bookmark-line text-xl" />
              <div className="text-left">
                <div className="font-medium">My Reservations</div>
                <div className="text-xs text-muted-foreground">View your booking history</div>
              </div>
            </Button>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
            >
              <i className="ri-heart-line text-xl" />
              <div className="text-left">
                <div className="font-medium">Favorite Dishes</div>
                <div className="text-xs text-muted-foreground">Save your favorite items</div>
              </div>
            </Button>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
            >
              <i className="ri-notification-line text-xl" />
              <div className="text-left">
                <div className="font-medium">Notifications</div>
                <div className="text-xs text-muted-foreground">Manage your alerts</div>
              </div>
            </Button>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
            >
              <i className="ri-global-line text-xl" />
              <div className="text-left">
                <div className="font-medium">Language</div>
                <div className="text-xs text-muted-foreground">English (EN)</div>
              </div>
            </Button>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
            >
              <i className="ri-settings-line text-xl" />
              <div className="text-left">
                <div className="font-medium">Settings</div>
                <div className="text-xs text-muted-foreground">App preferences</div>
              </div>
            </Button>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
            >
              <i className="ri-information-line text-xl" />
              <div className="text-left">
                <div className="font-medium">About</div>
                <div className="text-xs text-muted-foreground">App version & info</div>
              </div>
            </Button>
          </div>

          {/* Contact Info */}
          <Card className="glass-effect border-border/50 p-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <i className="ri-map-pin-line text-primary" />
              <span>43 An Hải 20, Đà Nẵng</span>
            </p>
            <p className="flex items-center gap-2">
              <i className="ri-phone-line text-primary" />
              <span>+84 123 456 789</span>
            </p>
            <p className="flex items-center gap-2">
              <i className="ri-time-line text-primary" />
              <span>10:00 AM - 2:00 PM, 4:30 PM - 9:30 PM</span>
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;