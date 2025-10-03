import { useState } from "react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MobileTopBar = () => {
  const [language, setLanguage] = useState("EN");

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
      <img src={logo} alt="Logo" className="w-12 h-12" />
      
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-effect border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
          <i className="ri-global-line text-sm" />
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileTopBar;
