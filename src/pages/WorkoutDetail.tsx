import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Clock, Flame } from "lucide-react";
import { pushPullLegPlan, highVolumeSplitPlan } from "@/data/workoutData";
import BottomNav from "@/components/BottomNav";

const WorkoutDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  // Updated logic to match the new ID 'volume-split' while still supporting 'bro' if needed
  const plan = planId === "ppl" 
    ? pushPullLegPlan 
    : (planId === "bro" || planId === "volume-split") 
    ? highVolumeSplitPlan 
    : null;

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-body">Workout plan not found.</p>
        <button 
          onClick={() => navigate("/workouts")}
          className="btn-outline text-sm"
        >
          Back to Plans
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section */}
      <div className="px-6 pt-8 pb-4 flex items-start gap-4">
        <button 
          onClick={() => navigate("/workouts")} 
          className="mt-1 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-heading text-4xl text-foreground uppercase tracking-tight"
          >
            {plan.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm font-body leading-relaxed max-w-md mt-1"
          >
            {plan.description}
          </motion.p>
        </div>
      </div>

      {/* Days List */}
      <div className="px-6 mt-6 space-y-4">
        {plan.days.map((day, i) => (
          <motion.div
            key={day.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/workout/${planId}/${day.id}`)}
            className="glass-card p-5 cursor-pointer hover:border-primary/40 transition-all group relative overflow-hidden"
          >
            {/* Subtle background glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-heading text-2xl text-foreground uppercase tracking-wide group-hover:text-primary transition-colors">
                  {day.name}
                </h3>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mt-1">
                  Focus: {day.focus}
                </p>
                
                <div className="flex items-center gap-4 mt-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                    <Clock className="h-3 w-3 text-primary" /> ~60 MIN
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                    <Flame className="h-3 w-3 text-primary" /> {day.exercises.length} EXERCISES
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-black transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkoutDetail;