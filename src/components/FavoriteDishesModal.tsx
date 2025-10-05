import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { menuCategories } from "@/pages/Menu"; // We will get the full menu data from the Menu page for now

// Flatten all menu items into a single array to make them easy to search
const allMenuItems = Object.values(menuCategories).flat();

interface FavoriteDishesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FavoriteDishesModal = ({ open, onOpenChange }: FavoriteDishesModalProps) => {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_favorite_dishes')
                .select('menu_item_id')
                .eq('user_id', user.id);
            if (error) throw error;
            setFavoriteIds(new Set(data.map(fav => fav.menu_item_id)));
        } catch (error: any) {
            toast.error("Failed to load favorites.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFavorites();
        }
    }, [open, user]);

    const handleUnfavorite = async (itemId: number) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('user_favorite_dishes').delete().match({ user_id: user.id, menu_item_id: itemId });
            if (error) throw error;
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
            toast.success("Removed from favorites.");
        } catch (error) {
            toast.error("Failed to remove favorite.");
        }
    };

    const favoriteItems = useMemo(() => {
        return allMenuItems.filter(item => favoriteIds.has(item.id));
    }, [favoriteIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>My Favorite Dishes</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {loading ? <p>Loading...</p> : (
                favoriteItems.length > 0 ? favoriteItems.map(item => (
                    <Card key={item.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-primary">{item.price} VND</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleUnfavorite(item.id)}>Remove</Button>
                        </CardContent>
                    </Card>
                )) : <p>You have no favorite dishes yet.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FavoriteDishesModal;