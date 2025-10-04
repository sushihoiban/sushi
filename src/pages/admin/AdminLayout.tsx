import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const adminNavLinks = [
    { to: "/admin/dashboard", icon: "ri-dashboard-line", label: "Dashboard" },
    { to: "/admin/availability", icon: "ri-calendar-check-line", label: "Availability" },
    { to: "/admin/bookings", icon: "ri-bookmark-line", label: "Bookings" },
    { to: "/admin/tables", icon: "ri-table-line", label: "Tables" },
    { to: "/admin/customers", icon: "ri-group-line", label: "Customers" },
];

const AdminLayout = () => {
    const { profile } = useAuth();

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="w-64 bg-secondary border-r border-border p-4 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <p className="text-sm text-muted-foreground">{profile?.full_name || "Admin"}</p>
                </div>
                <nav className="flex flex-col gap-2">
                    {adminNavLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                }`
                            }
                        >
                            <i className={link.icon} />
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>
                 <div className="mt-auto">
                    <NavLink to="/home" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted text-sm text-muted-foreground">
                        <i className="ri-arrow-left-line" />
                        <span>Back to Home</span>
                    </NavLink>
                </div>
            </aside>
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;