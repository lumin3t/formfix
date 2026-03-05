import { Link, useLocation } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: "/", label: "Home" },
    { to: "/recipes", label: "Recipes" },
    { to: "/scan", label: "Calories" },
    { to: "/workouts", label: "Exercises" },
    { to: "/recipes", label: "Meal Plan" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-display text-2xl text-foreground">FITFORGE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                path === link.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link to="/login">
          <Button className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
