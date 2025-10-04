import { AdminBookingForm } from "@/components/AdminBookingForm";

const AdminDashboard = () => (
    <div>
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground mb-6">Create a new booking or view key metrics.</p>
        
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Book</h2>
            <AdminBookingForm />
        </div>
        
        <div>
            <h2 className="text-xl font-semibold mb-4">Today's Stats</h2>
            <p className="text-muted-foreground">Key metrics will be displayed here.</p>
            {/* TODO: Add stats cards */}
        </div>
    </div>
);
export default AdminDashboard;