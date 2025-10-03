import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sushi-user-logged-in', 'true');
    toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    setTimeout(() => navigate('/home'), 1000);
  };

  const handleGuestAccess = () => {
    localStorage.setItem('sushi-guest-mode', 'true');
    navigate('/home');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <img src={logo} alt="HÓI BÁN SUSHI" className="w-32 h-32 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">HÓI BÁN SUSHI</h1>
            <p className="text-primary text-sm">Premium Japanese Dining Experience</p>
          </div>

          {/* Auth Card */}
          <Card className="glass-effect border-border/50 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type="text"
                    placeholder="Full Name"
                    required
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              )}

              <div className="relative">
                <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="email"
                  placeholder="Email Address"
                  required
                  className="pl-10 bg-secondary border-border"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              )}

              <div className="relative">
                <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="password"
                  placeholder="Password"
                  required
                  className="pl-10 bg-secondary border-border"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type="password"
                    placeholder="Confirm Password"
                    required
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              )}

              {isLogin ? (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <Checkbox />
                    <span>Remember me</span>
                  </label>
                  <Button type="button" variant="link" className="text-primary p-0 h-auto">
                    Forgot Password?
                  </Button>
                </div>
              ) : (
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Checkbox required className="mt-1" />
                  <span>
                    I agree to the <Button type="button" variant="link" className="text-primary p-0 h-auto">Terms of Service</Button> and <Button type="button" variant="link" className="text-primary p-0 h-auto">Privacy Policy</Button>
                  </span>
                </label>
              )}

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button
                  type="button"
                  variant="link"
                  className="text-primary p-0 ml-1 h-auto"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Button>
              </p>
            </div>
          </Card>

          {/* Guest Access */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">or</p>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-secondary"
              onClick={handleGuestAccess}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
