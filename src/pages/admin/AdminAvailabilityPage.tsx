import AvailabilityChecker from "@/components/AvailabilityChecker";

const AdminAvailabilityPage = () => (
    <div>
        <h1 className="text-3xl font-bold mb-4">Check Availability</h1>
        <p className="text-muted-foreground mb-6">Select a date to see a grid of all bookings for that day.</p>
        <AvailabilityChecker />
    </div>
);
export default AdminAvailabilityPage;