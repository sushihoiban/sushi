import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MenuItemModal from "./MenuItemModal";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  isFavorited: boolean;
  onFavoriteToggle: (itemId: number, isFavorited: boolean) => void;
}

const MenuItemCard = ({ item, isFavorited, onFavoriteToggle }: MenuItemCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    if (!user) {
        toast.error("Please log in to add favorites.");
        return;
    }
    onFavoriteToggle(item.id, isFavorited);
  }

  return (
    <>
      <Card 
        className="overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-elegant cursor-pointer group relative"
        onClick={() => setShowModal(true)}
      >
        {user && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 z-10 rounded-full glass-effect"
                onClick={handleFavoriteClick}
            >
                <i className={`ri-heart-3-${isFavorited ? 'fill' : 'line'} text-primary text-xl`} />
            </Button>
        )}
        <div className="aspect-video overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          {item.badge && (
            <Badge className="mb-2 bg-primary text-primary-foreground">
              {item.badge}
            </Badge>
          )}
          <h3 className="font-semibold mb-2 line-clamp-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
          <p className="text-xl font-bold text-primary">{item.price} VND</p>
        </div>
      </Card>

      <MenuItemModal 
        item={item}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
};

export default MenuItemCard;