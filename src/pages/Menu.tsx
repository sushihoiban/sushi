import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { menuCategories } from "@/lib/menu-data"; // Import from the new file

const Menu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchFavorites = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('user_favorite_dishes')
            .select('menu_item_id')
            .eq('user_id', user.id);
        if (error) {
            console.error(error);
        } else {
            setFavoriteIds(new Set(data.map(fav => fav.menu_item_id)));
        }
    };
    fetchFavorites();
  }, [user]);

  const handleFavoriteToggle = async (itemId: number, isFavorited: boolean) => {
    if (!user) return;

    if (isFavorited) {
        const { error } = await supabase.from('user_favorite_dishes').delete().match({ user_id: user.id, menu_item_id: itemId });
        if(error) {
            toast.error("Failed to remove favorite.");
        } else {
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    } else {
        const { error } = await supabase.from('user_favorite_dishes').insert({ user_id: user.id, menu_item_id: itemId });
         if(error) {
            toast.error("Failed to add favorite.");
        } else {
            setFavoriteIds(prev => new Set(prev).add(itemId));
        }
    }
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
                <DropdownMenuItem onClick={() => setLanguage("FR")}>
                  Français (French)
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
              {menuCategories.combos.map(item => <MenuItemCard key={item.id} item={item} isFavorited={favoriteIds.has(item.id)} onFavoriteToggle={handleFavoriteToggle} />)}
            </div>
          </TabsContent>

          <TabsContent value="hot">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.hot.map(item => <MenuItemCard key={item.id} item={item} isFavorited={favoriteIds.has(item.id)} onFavoriteToggle={handleFavoriteToggle} />)}
            </div>
          </TabsContent>

          <TabsContent value="noodles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.noodles.map(item => <MenuItemCard key={item.id} item={item} isFavorited={favoriteIds.has(item.id)} onFavoriteToggle={handleFavoriteToggle} />)}
            </div>
          </TabsContent>

          <TabsContent value="beverages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {menuCategories.beverages.map(item => <MenuItemCard key={item.id} item={item} isFavorited={favoriteIds.has(item.id)} onFavoriteToggle={handleFavoriteToggle} />)}
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