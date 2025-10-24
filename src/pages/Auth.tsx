import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-image-bg.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");
  const [language, setLanguage] = useState("EN");

  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignupMessage("");

    if (isLogin) {
      // Handle Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/home");
      }
    } else {
      // Handle Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        // This part is crucial. Check if user needs confirmation.
        if (data.user.identities?.length === 0) {
            setSignupMessage("An error occurred, but please check your email for a confirmation link anyway.");
        } else {
            setSignupMessage("Sign up successful! Please check your email for a confirmation link to log in.");
        }
        toast.info("Please confirm your email.");
      }
    }
    setLoading(false);
  };

  const handleGuestAccess = () => {
    // This functionality might need to be re-evaluated.
    // For now, it will just navigate to the home page.
    navigate("/home");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
      </div>

      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
            <i className="ri-global-line text-lg" />
            <span className="text-sm font-medium">{language}</span>
            <i className="ri-arrow-down-s-line text-sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-lg border-border/50">
            <DropdownMenuItem onClick={() => setLanguage("EN")}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("VI")}>Tiếng Việt</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("KO")}>한국어 (Korean)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("ZH")}>中文 (Chinese)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("JA")}>日本語 (Japanese)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("RU")}>Русский (Russian)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("ES")}>Español (Spanish)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("DE")}>Deutsch (German)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("FR")}>Français (French)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("TL")}>Filipino (Tagalog)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("TH")}>ไทย (Thai)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("ID")}>Bahasa Indonesia</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="HÓI BÁN SUSHI" className="w-48 h-48 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">HÓI BÁN SUSHI</h1>
            <p className="text-primary text-sm">Premium Japanese Dining Experience</p>
          </div>
          
          {signupMessage ? (
             <Card className="glass-effect border-border/50 p-6 mb-6 text-center">
                <h2 className="text-xl font-bold mb-4">Check your inbox</h2>
                <p className="text-muted-foreground">{signupMessage}</p>
             </Card>
          ) : (
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    />
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
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
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">or</p>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-secondary hover:text-foreground"
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