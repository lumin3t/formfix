import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, ArrowRight, BarChart3, Flame } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import pushImg from "@/assets/push-workout.jpg";
import broImg from "@/assets/bro-split.jpg";
import customImg from "@/assets/custom-workout.jpg";
import Navbar from "@/components/Navbar";

import heroImg from "@/assets/pull-workout.jpg";

const plans = [
  { 
    id: "ppl", 
    name: "Push Pull Legs", 
    image: pushImg, 
    desc: "Classic 3-day split targeting functional movement patterns for balanced strength.", 
    days: "3 Days/Week", 
    level: "Intermediate" 
  },
  { 
    id: "volume-split", // Updated ID to match the new professional naming
    name: "Body Part Split", 
    image: broImg, 
    desc: "High-volume 5-day split designed for maximum muscle focus and hypertrophy.", 
    days: "5 Days/Week", 
    level: "Advanced" // Increased level to match the high-volume nature
  },
  { 
    id: "custom", 
    name: "Custom Plan", 
    image: customImg, 
    desc: "AI-designed training program tailored specifically to your body and goals.", 
    days: "Flexible", 
    level: "Personalized" 
  },
];

const Workouts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Workout"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="stat-badge mx-auto w-fit mb-6"
          >
            <Flame className="w-3.5 h-3.5" /> Choose your training split
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-5xl md:text-8xl font-heading text-foreground leading-[0.9] mb-5 tracking-wider"
          >
            Workout <span className="text-gradient">Plans</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto font-body leading-relaxed"
          >
            Select a training program that matches your goals. Each plan includes
            detailed exercises with sets, reps, and expert tips.
          </motion.p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={() => {
                if (plan.id === "custom") {
                  navigate("/quiz");
                } else {
                  navigate(`/workout/${plan.id}`);
                }
              }}
              className="group cursor-pointer glass-card overflow-hidden hover-lift"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                {/* Overlay badge */}
                <div className="absolute top-4 right-4">
                  <span className={i % 2 === 0 ? "stat-badge" : "accent-badge"}>
                    {plan.days}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <h2 className="text-4xl font-heading text-foreground tracking-wide mb-1">{plan.name}</h2>
                  <p className="text-xs text-primary font-mono font-medium">{plan.level}</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-muted-foreground text-sm mb-5 font-body leading-relaxed">{plan.desc}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="stat-badge">
                      <Dumbbell className="w-3 h-3" /> {plan.days}
                    </span>
                    <span className="accent-badge">
                      <BarChart3 className="w-3 h-3" /> {plan.level}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
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

export default Workouts;