import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import pushImg from "@/assets/push-workout.jpg";
import pullImg from "@/assets/pull-workout.jpg";
import legsImg from "@/assets/legs-workout.jpg";
import broImg from "@/assets/bro-split.jpg";
import customImg from "@/assets/custom-workout.jpg";

const plans = [
  { id: "ppl", name: "Push Pull Legs", image: pushImg, desc: "Classic 3-day split for balanced strength", days: "3 Days/Week", level: "Intermediate" },
  { id: "bro", name: "Bro Split", image: broImg, desc: "5-day body part split for maximum volume", days: "5 Days/Week", level: "All Levels" },
  { id: "custom", name: "Custom Plan", image: customImg, desc: "AI-designed plan based on your quiz results", days: "Flexible", level: "Personalized" },
];

const Workouts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-3xl text-foreground">WORKOUT PLANS</h1>
      </div>

      <div className="px-5 space-y-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => {
              if (plan.id === "custom") {
                navigate("/quiz");
              } else {
                navigate(`/workout/${plan.id}`);
              }
            }}
            className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group"
          >
            <img
              src={plan.image}
              alt={plan.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-5">
              <div className="flex gap-2 mb-2">
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{plan.days}</span>
                <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{plan.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-3xl text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.desc}</p>
                </div>
                <ChevronRight className="h-6 w-6 text-primary flex-shrink-0" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Workouts;
