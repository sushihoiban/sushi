import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CartItem {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  quantity: number;
  notes?: string;
}

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartModal = ({ open, onOpenChange }: CartModalProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (open) {
      const savedCart = JSON.parse(localStorage.getItem('sushi-cart') || '[]');
      setCart(savedCart);
    }
  }, [open]);

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('sushi-cart', JSON.stringify(newCart));
    toast.success("Item removed from cart");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    toast.success("Order placed successfully! We'll prepare your order shortly.");
    localStorage.setItem('sushi-cart', '[]');
    setCart([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-border/50 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Cart</DialogTitle>
        </DialogHeader>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-shopping-cart-line text-6xl text-muted-foreground mb-4 block" />
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 bg-secondary p-4 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.quantity}x {item.price} VND
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <i className="ri-delete-bin-line text-xl" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Subtotal</span>
                <span>{calculateTotal().toFixed(3)} VND</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax (10%)</span>
                <span>{(calculateTotal() * 0.1).toFixed(3)} VND</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t border-border">
                <span>Total</span>
                <span>{(calculateTotal() * 1.1).toFixed(3)} VND</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCheckout}
              >
                <i className="ri-check-line mr-2" />
                Place Order
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
