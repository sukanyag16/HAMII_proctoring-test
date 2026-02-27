import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">HAMII</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#algorithms" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
            Algorithms
          </a>
          <a href="#features" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <Link to="/test">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Start Interview
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
