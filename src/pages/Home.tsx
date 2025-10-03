import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import MenuItemCard from "@/components/MenuItemCard";
import BookingModal from "@/components/BookingModal";
import CartModal from "@/components/CartModal";
const Home = () => {
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const featuredItems = [{
    id: 1,
    title: "97. Combo 1",
    description: "Avocado, Fresh Salmon with Sesame Sauce Salad, Crab Stick, Cucumber Roll, Shrimp with Avocado Maki",
    price: "510.000",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop"
  }, {
    id: 2,
    title: "101. Baked Crab Shell with Cheese",
    description: "Crab Meat, Crab Stick in Crab Shell with Cheese, Tobiko topping",
    price: "90.000",
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&h=300&fit=crop",
    badge: "HOT FOOD"
  }, {
    id: 3,
    title: "98. Combo 2",
    description: "Avocado, Fried Salmon Skin with Sesame Sauce, Deep-Fried Shrimp Tempura and Avocado Roll",
    price: "583.000",
    image: "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400&h=300&fit=crop"
  }, {
    id: 4,
    title: "114. Stir Fried Beef Udon",
    description: "Tender beef with thick udon noodles and fresh vegetables",
    price: "85.000",
    image: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400&h=300&fit=crop"
  }];
  return <div className="min-h-screen">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            
            <div className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => navigate('/home')}>
                Home
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => navigate('/menu')}>
                Menu
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => setShowBooking(true)}>
                Reservations
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            <Button variant="ghost" size="icon">
              <i className="ri-user-line text-xl" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: `url(${heroBg})`
      }}>
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <img src={logo} alt="Logo" className="w-48 h-48 mx-auto mb-6" />
          <h2 className="text-5xl font-bold mb-4">Premium Japanese Dining</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Authentic flavors crafted with precision and passion, bringing you the finest sushi and Japanese cuisine in an exclusive atmosphere
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant" onClick={() => setShowBooking(true)}>
              <i className="ri-calendar-line mr-2" />
              Reserve a Table
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => navigate('/menu')}>
              <i className="ri-restaurant-line mr-2" />
              View Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="glass-effect border-border/50 p-8 text-center hover:shadow-elegant transition-all cursor-pointer" onClick={() => setShowBooking(true)}>
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <i className="ri-calendar-line text-primary text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Table Booking</h3>
            <p className="text-muted-foreground">Reserve your spot for an unforgettable dining experience</p>
          </Card>
          
          <Card className="glass-effect border-border/50 p-8 text-center hover:shadow-elegant transition-all cursor-pointer" onClick={() => navigate('/menu')}>
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <i className="ri-restaurant-line text-primary text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">View Menu</h3>
            <p className="text-muted-foreground">Explore our exquisite selection of Japanese cuisine</p>
          </Card>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Featured Combos</h2>
          <p className="text-muted-foreground">Discover our most popular dishes</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map(item => <MenuItemCard key={item.id} item={item} />)}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" onClick={() => navigate('/menu')}>
            View Full Menu
            <i className="ri-arrow-right-line ml-2" />
          </Button>
        </div>
      </section>

      {/* Restaurant Info */}
      <section className="container mx-auto px-6 py-12">
        <Card className="glass-effect border-border/50 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Visit Our Restaurant</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <i className="ri-map-pin-line text-primary text-3xl mb-3 block" />
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">43 An Hải 20, Đà Nẵng</p>
            </div>
            <div className="text-center">
              <i className="ri-phone-line text-primary text-3xl mb-3 block" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-muted-foreground">+84 123 456 789</p>
            </div>
            <div className="text-center">
              <i className="ri-time-line text-primary text-3xl mb-3 block" />
              <h3 className="font-semibold mb-2">Hours</h3>
              <p className="text-muted-foreground">10:00 AM - 2:00 PM<br />4:30 PM - 9:30 PM</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Modals */}
      <BookingModal open={showBooking} onOpenChange={setShowBooking} />
      <CartModal open={showCart} onOpenChange={setShowCart} />
    </div>;
};
export default Home;