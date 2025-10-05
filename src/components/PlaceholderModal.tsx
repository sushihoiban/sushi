import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PlaceholderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

const PlaceholderModal = ({ open, onOpenChange, title }: PlaceholderModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="py-4 text-muted-foreground">This feature is not yet available.</p>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceholderModal;