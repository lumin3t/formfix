import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Clock, Flame } from "lucide-react";
import { pushPullLegPlan, broSplitPlan } from "@/data/workoutData";
import BottomNav from "@/components/BottomNav";

const WorkoutDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const plan = planId === "ppl" ? pushPullLegPlan : planId === "bro" ? broSplitPlan : null;

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6 pb-2 flex items-center gap-3">
        <button onClick={() => navigate("/workouts")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="font-display text-3xl text-foreground">{plan.name}</h1>
          <p className="text-muted-foreground text-sm">{plan.description}</p>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {plan.days.map((day, i) => (
          <motion.div
            key={day.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(`/workout/${planId}/${day.id}`)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-display text-2xl text-foreground">{day.name}</h3>
                <p className="text-muted-foreground text-sm">{day.focus}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> ~60 min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="h-3 w-3" /> {day.exercises.length} exercises
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkoutDetail;
