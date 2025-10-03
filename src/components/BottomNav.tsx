import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavProps {
  onCartClick?: () => void;
  onProfileClick?: () => void;
}

const BottomNav = ({ onCartClick, onProfileClick }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border/50 pb-safe">
      <div className="grid grid-cols-4 h-16">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/home') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <i className="ri-home-5-line text-2xl" />
          <span className="text-xs">Home</span>
        </button>

        <button
          onClick={() => navigate('/menu')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/menu') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <i className="ri-restaurant-line text-2xl" />
          <span className="text-xs">Menu</span>
        </button>

        <button
          onClick={onCartClick}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary"
        >
          <i className="ri-shopping-cart-line text-2xl" />
          <span className="text-xs">Cart</span>
        </button>

        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary"
        >
          <i className="ri-user-line text-2xl" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
