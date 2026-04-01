// src/pages/Workouts.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PlanCard from "@/components/workouts/PlanCard";
import { pushPullLegPlan, highVolumeSplitPlan } from "@/data/workoutData";

const Workouts = () => {
  const navigate = useNavigate();

  // Map your imported data objects into an array
  const allPlans = [pushPullLegPlan, highVolumeSplitPlan];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[40vh] flex items-center justify-center text-center px-4">
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-badge mx-auto mb-4">
            <Flame className="w-3 h-3" /> PRO TRAINING
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-heading text-foreground uppercase">
            Workout <span className="text-gradient">Plans</span>
          </h1>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPlans.map((plan, i) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            index={i} 
            onClick={() => navigate(`/workout/${plan.id}`)} 
          />
        ))}
        
        {/* Manual Custom Card */}
        <PlanCard 
          plan={{
            id: "custom",
            name: "Custom AI",
            description: "Personalized routine based on your goals.",
            days: [] as any, // Placeholder to satisfy interface
            image: ""
          }}
          index={2}
          onClick={() => navigate("/quiz")}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Workouts;