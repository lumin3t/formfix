import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Apple, Target, TrendingUp, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import heroImg from "@/assets/hero-fitness.jpg";

const features = [
  { icon: Apple, title: "Add Recipes", desc: "Add and organize your healthy recipes", color: "text-green-400" },
  { icon: Target, title: "Calorie Tracker", desc: "Track your daily caloric intake and goals", color: "text-red-400" },
  { icon: TrendingUp, title: "Workout Plans", desc: "Structured exercises for different muscle groups", color: "text-primary" },
  { icon: CalendarDays, title: "Meal Planning", desc: "Plan your meals and get food suggestions", color: "text-blue-400" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        <img src={heroImg} alt="Fitness" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />

        <div className="relative z-10 text-center px-5 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl md:text-7xl text-foreground leading-tight mb-4"
          >
            TRANSFORM YOUR FITNESS JOURNEY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-8"
          >
            Complete fitness solution with personalized workouts, nutrition tracking, and meal planning to achieve your health goals.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate("/login")}
              className="h-12 px-8 bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
            >
              Start Your Journey
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/workouts")}
              className="h-12 px-8 border-foreground/30 text-foreground font-semibold text-base hover:bg-foreground/10"
            >
              Learn More
            </Button>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="absolute bottom-8 left-0 right-0 px-5">
          <div className="container grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="bg-card/60 backdrop-blur-md border border-border/50 rounded-xl p-5 text-center cursor-pointer hover:bg-card/80 transition-colors"
                onClick={() => {
                  if (f.title === "Add Recipes") navigate("/recipes");
                  else if (f.title === "Calorie Tracker") navigate("/scan");
                  else if (f.title === "Workout Plans") navigate("/workouts");
                  else navigate("/recipes");
                }}
              >
                <f.icon className={`h-8 w-8 mx-auto mb-2 ${f.color}`} />
                <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default Index;
