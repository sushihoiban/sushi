import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingModal = ({ open, onOpenChange }: BookingModalProps) => {
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("18:00");

  const timeSlots = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Table reserved successfully! We look forward to serving you.");
    onOpenChange(false);
  };

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate()
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-border/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reserve a Table</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleBooking} className="space-y-6">
          {/* Party Size */}
          <div>
            <label className="block text-sm font-medium mb-3">Party Size</label>
            <div className="flex items-center justify-center gap-4 p-4 bg-secondary rounded-lg">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="h-12 w-12 rounded-full"
              >
                <i className="ri-subtract-line text-xl" />
              </Button>
              <span className="text-3xl font-bold w-16 text-center">{partySize}</span>
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={() => setPartySize(Math.min(20, partySize + 1))}
                className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
              >
                <i className="ri-add-line text-xl" />
              </Button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Date</label>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((d, index) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedDate === d.date || (index === 0 && !selectedDate)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <div className="text-xs">{d.dayName}</div>
                  <div className="font-semibold">{d.dayNum}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Time</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedTime === time
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Your Name"
              required
              className="bg-secondary border-border"
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              required
              className="bg-secondary border-border"
            />
          </div>

          {/* Info */}
          <div className="bg-secondary p-4 rounded-lg text-sm text-muted-foreground space-y-2">
            <p><i className="ri-map-pin-line mr-2 text-primary" />Location: 43 An Hải 20, Đà Nẵng</p>
            <p><i className="ri-information-line mr-2 text-primary" />Reservation confirmation will be sent via SMS</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm Reservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
