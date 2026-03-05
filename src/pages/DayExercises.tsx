import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Target, Info } from "lucide-react";
import { pushPullLegPlan, broSplitPlan } from "@/data/workoutData";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const DayExercises = () => {
  const { planId, dayId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const plan = planId === "ppl" ? pushPullLegPlan : planId === "bro" ? broSplitPlan : null;
  const day = plan?.days.find((d) => d.id === dayId);

  if (!day) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Day not found</p>
      </div>
    );
  }

  const toggleComplete = (exerciseId: string) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId]
    );
  };

  const progress = (completedExercises.length / day.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(`/workout/${planId}`)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-foreground">{day.name}</h1>
          <p className="text-muted-foreground text-sm">{day.focus}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 my-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">{completedExercises.length}/{day.exercises.length} completed</span>
          <span className="text-primary font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="px-5 space-y-3">
        {day.exercises.map((exercise, i) => {
          const isCompleted = completedExercises.includes(exercise.id);
          const isExpanded = expandedExercise === exercise.id;

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card border rounded-xl overflow-hidden transition-colors ${
                isCompleted ? "border-primary/50 bg-primary/5" : "border-border"
              }`}
            >
              <div
                className="p-4 flex items-center gap-3 cursor-pointer"
                onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(exercise.id);
                  }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-primary border-primary"
                      : "border-muted-foreground hover:border-primary"
                  }`}
                >
                  {isCompleted && <Check className="h-4 w-4 text-primary-foreground" />}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-foreground ${isCompleted ? "line-through opacity-60" : ""}`}>
                    {exercise.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {exercise.sets} sets × {exercise.reps} · {exercise.muscle}
                  </p>
                </div>

                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3" /> Form Tips
                        </p>
                        <ul className="space-y-1">
                          {exercise.tips.map((tip, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Complete Workout Button */}
      {completedExercises.length === day.exercises.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-0 right-0 px-5"
        >
          <Button
            onClick={() => {
              toast({ title: "Workout Complete! 🎉💪" });
              navigate(`/workout/${planId}`);
            }}
            className="w-full h-14 bg-primary text-primary-foreground font-display text-xl animate-pulse-glow"
          >
            COMPLETE WORKOUT
          </Button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default DayExercises;
