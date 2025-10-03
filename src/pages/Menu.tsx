import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuItemCard from "@/components/MenuItemCard";
import BookingModal from "@/components/BookingModal";
import ProfileModal from "@/components/ProfileModal";
import BottomNav from "@/components/BottomNav";
import MobileTopBar from "@/components/MobileTopBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const Menu = () => {
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [language, setLanguage] = useState("EN");
  const menuCategories = {
    combos: [{
      id: 1,
      title: "97. Combo 1",
      price: "510.000",
      description: "Avocado, Fresh Salmon with Sesame Sauce Salad, Crab Stick, Cucumber Roll, Shrimp with Avocado Maki",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop"
    }, {
      id: 2,
      title: "98. Combo 2",
      price: "583.000",
      description: "Avocado, Fried Salmon Skin with Sesame Sauce, Deep-Fried Shrimp Tempura and Avocado Roll",
      image: "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400&h=300&fit=crop"
    }, {
      id: 3,
      title: "99. Combo 3",
      price: "675.000",
      description: "Premium selection of sashimi, nigiri, and specialty rolls with miso soup",
      image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400&h=300&fit=crop"
    }, {
      id: 4,
      title: "100. Dragon Roll Special",
      price: "420.000",
      description: "Shrimp tempura inside, topped with avocado and eel, drizzled with eel sauce",
      image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop"
    }],
    hot: [{
      id: 5,
      title: "101. Baked Crab Shell with Cheese",
      price: "90.000",
      description: "Crab Meat, Crab Stick in Crab Shell with Cheese, Tobiko topping",
      image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&h=300&fit=crop",
      badge: "HOT"
    }, {
      id: 6,
      title: "102. Grilled Salmon Teriyaki",
      price: "125.000",
      description: "Fresh grilled salmon glazed with teriyaki sauce, served with steamed rice",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop"
    }, {
      id: 7,
      title: "103. Tempura Prawns",
      price: "95.000",
      description: "Crispy tempura battered prawns served with dipping sauce",
      image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=300&fit=crop"
    }, {
      id: 8,
      title: "104. Chicken Katsu Curry",
      price: "110.000",
      description: "Breaded chicken cutlet with Japanese curry sauce and steamed rice",
      image: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400&h=300&fit=crop"
    }],
    noodles: [{
      id: 9,
      title: "114. Stir Fried Beef Udon",
      price: "85.000",
      description: "Tender beef with thick udon noodles and fresh vegetables",
      image: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400&h=300&fit=crop"
    }, {
      id: 10,
      title: "115. Chicken Ramen",
      price: "75.000",
      description: "Rich chicken broth with ramen noodles, soft-boiled egg, and vegetables",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop"
    }, {
      id: 11,
      title: "116. Seafood Yakisoba",
      price: "95.000",
      description: "Stir-fried yakisoba noodles with mixed seafood and vegetables",
      image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop"
    }, {
      id: 12,
      title: "117. Tonkotsu Ramen",
      price: "95.000",
      description: "Rich pork bone broth with ramen noodles, chashu pork, and toppings",
      image: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=400&h=300&fit=crop"
    }],
    beverages: [{
      id: 13,
      title: "Green Tea",
      price: "25.000",
      description: "Traditional Japanese green tea",
      image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop"
    }, {
      id: 14,
      title: "Sake Premium",
      price: "150.000",
      description: "Premium Japanese sake served in traditional tokkuri",
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop"
    }, {
      id: 15,
      title: "Iced Matcha Latte",
      price: "55.000",
      description: "Creamy matcha green tea latte served over ice",
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop"
    }, {
      id: 16,
      title: "Plum Wine",
      price: "120.000",
      description: "Sweet Japanese plum wine (umeshu)",
      image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop"
    }]
  };
  return <div className="min-h-screen pb-20 md:pb-12">
      {/* Mobile Top Bar */}
      <MobileTopBar />
      
      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-40 glass-effect border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            
            <div className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => navigate('/home')}>
                Home
              </Button>
              <Button variant="ghost" className="text-primary">
                Menu
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                <i className="ri-global-line text-lg" />
                <span className="text-sm font-medium">{language}</span>
                <i className="ri-arrow-down-s-line text-sm" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-lg border-border/50">
                <DropdownMenuItem onClick={() => setLanguage("EN")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("VI")}>
                  Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("KO")}>
                  한국어 (Korean)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ZH")}>
                  中文 (Chinese)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("JA")}>
                  日本語 (Japanese)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("RU")}>
                  Русский (Russian)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ES")}>
                  Español (Spanish)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("DE")}>
                  Deutsch (German)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("TL")}>
                  Filipino (Tagalog)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("TH")}>
                  ไทย (Thai)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ID")}>
                  Bahasa Indonesia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" onClick={() => setShowBooking(true)}>
              <i className="ri-calendar-line text-xl" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowProfile(true)}>
              <i className="ri-user-line text-xl" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Menu Content */}
      <div className="container mx-auto px-4 md:px-6 pt-16 md:pt-24">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 md:mb-2">Our Menu</h1>
          <p className="text-sm md:text-base text-muted-foreground">Explore our exquisite selection of Japanese cuisine</p>
        </div>

        <Tabs defaultValue="combos" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6 md:mb-8 bg-secondary text-xs md:text-sm">
            <TabsTrigger value="combos" className="px-2 md:px-4">Sushi Combos</TabsTrigger>
            <TabsTrigger value="hot" className="px-2 md:px-4">Hot Dishes</TabsTrigger>
            <TabsTrigger value="noodles" className="px-2 md:px-4">Noodles</TabsTrigger>
            <TabsTrigger value="beverages" className="px-2 md:px-4">Beverages</TabsTrigger>
          </TabsList>

          <TabsContent value="combos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.combos.map(item => <MenuItemCard key={item.id} item={item} />)}
            </div>
          </TabsContent>

          <TabsContent value="hot">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.hot.map(item => <MenuItemCard key={item.id} item={item} />)}
            </div>
          </TabsContent>

          <TabsContent value="noodles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.noodles.map(item => <MenuItemCard key={item.id} item={item} />)}
            </div>
          </TabsContent>

          <TabsContent value="beverages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.beverages.map(item => <MenuItemCard key={item.id} item={item} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BookingModal open={showBooking} onOpenChange={setShowBooking} />
      <ProfileModal open={showProfile} onOpenChange={setShowProfile} />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav 
        onBookingClick={() => setShowBooking(true)}
        onProfileClick={() => setShowProfile(true)}
      />
    </div>;
};
export default Menu;