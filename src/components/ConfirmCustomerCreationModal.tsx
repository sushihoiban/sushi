import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmCustomerCreationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  customerName: string;
}

const ConfirmCustomerCreationModal = ({ open, onConfirm, onCancel, customerName }: ConfirmCustomerCreationModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Customer?</AlertDialogTitle>
          <AlertDialogDescription>
            The customer "{customerName}" is not in your records. Would you like to add them to your customer list?
            <br /><br />
            Choosing "Yes" will save their details for future bookings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>No</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, Add Customer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmCustomerCreationModal;