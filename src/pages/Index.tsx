import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, ChevronRight, Flame, Trophy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import pushImg from "@/assets/push-workout.jpg";
import pullImg from "@/assets/pull-workout.jpg";
import legsImg from "@/assets/legs-workout.jpg";
import broImg from "@/assets/bro-split.jpg";
import customImg from "@/assets/custom-workout.jpg";

const workoutPlans = [
  { id: "ppl", name: "Push Pull Legs", image: pushImg, tag: "Popular", days: "3 Days" },
  { id: "bro", name: "Bro Split", image: broImg, tag: "Classic", days: "5 Days" },
  { id: "custom", name: "Custom Plan", image: customImg, tag: "AI Powered", days: "Flexible" },
];

const stats = [
  { icon: Flame, value: "1,240", label: "Calories", color: "text-orange-400" },
  { icon: Trophy, value: "12", label: "Workouts", color: "text-primary" },
  { icon: Dumbbell, value: "28h", label: "Training", color: "text-blue-400" },
];

const Index = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("fitUser") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("fitUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="font-display text-3xl text-foreground">{user.name || user.email || "ATHLETE"}</h1>
        </div>
        <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground p-2">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 text-center border border-border"
            >
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <p className="font-display text-2xl text-foreground">{stat.value}</p>
              <p className="text-muted-foreground text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Workout Plans */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl text-foreground">WORKOUT PLANS</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-sm"
            onClick={() => navigate("/workouts")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          {workoutPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => {
                if (plan.id === "custom") {
                  navigate("/quiz");
                } else {
                  navigate(`/workout/${plan.id}`);
                }
              }}
              className="relative h-36 rounded-xl overflow-hidden cursor-pointer group"
            >
              <img
                src={plan.image}
                alt={plan.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
              <div className="relative h-full flex flex-col justify-between p-5">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {plan.tag}
                  </span>
                  <span className="text-muted-foreground text-xs">{plan.days}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-3xl text-foreground">{plan.name}</h3>
                  <ChevronRight className="h-6 w-6 text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
