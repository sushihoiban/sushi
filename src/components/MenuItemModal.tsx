import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

          <div className="flex items-center justify-center">
            <p className="text-3xl font-bold text-primary">{item.price} VND</p>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              <i className="ri-information-line mr-2" />
              Menu is for viewing only. Make a reservation to enjoy our dishes!
            </p>
          </div>

          <Button
            variant="default"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemModal;
