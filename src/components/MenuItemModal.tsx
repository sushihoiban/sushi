import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MenuItem {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
}

interface MenuItemModalProps {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MenuItemModal = ({ item, open, onOpenChange }: MenuItemModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('sushi-cart') || '[]');
    cart.push({
      ...item,
      quantity,
      notes,
      addedAt: Date.now()
    });
    localStorage.setItem('sushi-cart', JSON.stringify(cart));
    toast.success(`${item.title} added to cart!`);
    onOpenChange(false);
    setQuantity(1);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-border/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-muted-foreground">{item.description}</p>

          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-primary">{item.price} VND</p>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-full"
              >
                <i className="ri-subtract-line" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="default"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
              >
                <i className="ri-add-line" />
              </Button>
            </div>
          </div>

          <Textarea
            placeholder="Special notes for this item..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-secondary border-border resize-none"
            rows={3}
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAddToCart}
            >
              <i className="ri-shopping-cart-line mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemModal;
