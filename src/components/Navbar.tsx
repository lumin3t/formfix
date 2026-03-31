import { Link, useLocation } from "react-router-dom";
import { Dumbbell } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: "/", label: "Home" },
    { to: "/recipes", label: "Recipes" },
    { to: "/scan", label: "Calories" },
    { to: "/workouts", label: "Exercises" },
  ];

  return (
    <nav className="nav-glass py-4 px-6 md:px-12 flex justify-between items-center z-50 fixed top-0 left-0 right-0">
      <Link to="/" className="flex items-center gap-2 hover-lift">
        <Dumbbell className="h-6 w-6 text-primary" />
        <span className="font-heading text-2xl tracking-wider text-foreground">
          FIT<span className="text-gradient">FORGE</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
              path === link.to ? "text-primary" : "text-foreground/70"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link to="/login">
        <button className="btn-primary px-6 py-2.5 text-sm">
          Get Started
        </button>
      </Link>
    </nav>
  );
};

export default Navbar;