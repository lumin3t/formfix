// src/pages/DayExercises.tsx
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Info, 
  Camera 
} from "lucide-react";
import { pushPullLegPlan, highVolumeSplitPlan } from "@/data/workoutData";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const DayExercises = () => {
  const { planId, dayId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Match plan data based on ID
  const plan = planId === "ppl" ? pushPullLegPlan : highVolumeSplitPlan;
  const day = plan?.days.find((d) => d.id === dayId);

  useEffect(() => {
    const completedExerciseId = searchParams.get("completed");
    if (!completedExerciseId) return;

    setCompletedExercises((prev) =>
      prev.includes(completedExerciseId) ? prev : [...prev, completedExerciseId]
    );
    toast({
      title: "EXERCISE STRUCK",
      description: "8+ clean reps logged through Green FormFix Lens.",
    });
    setSearchParams({});
  }, [searchParams, setSearchParams, toast]);

  if (!day) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Workout day not found</p>
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
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-3">
        <button 
          onClick={() => navigate(`/workout/${planId}`)} 
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-3xl text-foreground uppercase tracking-tight">
            {day.name}
          </h1>
          <p className="text-primary text-[10px] font-mono uppercase tracking-widest">
            {day.focus}
          </p>
        </div>
        
        {/* Main AR Lens Trigger */}
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-black transition-all"
          onClick={() => navigate(`/camera?plan=${planId}&day=${dayId}`)}
        >
          <Camera className="h-4 w-4" />
          <span className="font-mono text-[10px] font-bold">LENS</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-5 my-6">
        <div className="flex items-center justify-between text-[10px] font-mono mb-2 uppercase tracking-tighter">
          <span className="text-muted-foreground">Completion Status</span>
          <span className="text-primary">{completedExercises.length}/{day.exercises.length} Exercises</span>
        </div>
        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>
      </div>

      {/* Exercises List */}
      <div className="px-5 space-y-4">
        {day.exercises.map((exercise, i) => {
          const isCompleted = completedExercises.includes(exercise.id);
          const isExpanded = expandedExercise === exercise.id;

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card overflow-hidden transition-all duration-300 ${
                isCompleted ? "border-primary/20 bg-primary/5" : "border-white/5"
              }`}
            >
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
              >
                {/* Completion Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(exercise.id);
                  }}
                  className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {isCompleted && <Check className="h-3.5 w-3.5 text-black font-bold" />}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-heading text-lg leading-tight uppercase ${isCompleted ? "line-through opacity-40" : ""}`}>
                    {exercise.name}
                  </h3>
                  <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-tighter mt-1">
                    {exercise.sets} Sets · {exercise.reps} Reps · {exercise.muscle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                   {/* Specific Exercise Camera Trigger */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/camera?plan=${planId}&day=${dayId}&ex=${exercise.id}`);
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="px-4 pb-5 space-y-4 border-t border-white/5 pt-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {exercise.description}
                        </p>
                      </div>

                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3" /> Technical Execution
                        </p>
                        <ul className="space-y-1.5">
                          {exercise.tips.map((tip, j) => (
                            <li key={j} className="text-[11px] text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full" />
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
          className="fixed bottom-24 left-0 right-0 px-5 z-40"
        >
          <Button
            onClick={() => {
              toast({ 
                title: "WORKOUT COMPLETE", 
                description: "Hypertrophy session logged successfully. ⚡" 
              });
              navigate(`/workout/${planId}`);
            }}
            className="w-full h-14 bg-primary text-black font-heading text-xl tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          >
            END SESSION
          </Button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default DayExercises;
