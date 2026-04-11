// src/pages/Camera.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mic2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCamera } from "@/hooks/useCamera";
import { pushPullLegPlan, highVolumeSplitPlan } from "@/data/workoutData";
import { Button } from "@/components/ui/button";

type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
};

type AiResult = {
  exercise: string;
  display_name: string;
  confidence: number;
  reps: number;
  stage: string;
  correction: string;
  landmarks: Landmark[];
  tracked_angle: number;
  ready: boolean;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
  [27, 29],
  [29, 31],
  [28, 30],
  [30, 32],
];

const normalizeExercise = (name: string) =>
  name
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const Camera = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { videoRef, isActive, error } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestInFlight = useRef(false);
  const lastSpokenRef = useRef("");
  const milestonesSpokenRef = useRef<Set<number>>(new Set());

  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const planId = searchParams.get("plan") || "ppl";
  const dayId = searchParams.get("day") || "";
  const exerciseId = searchParams.get("ex") || "";

  const plan = planId === "ppl" ? pushPullLegPlan : highVolumeSplitPlan;
  const day = plan?.days.find((d) => d.id === dayId);
  const selectedExercise =
    day?.exercises.find((exercise) => exercise.id === exerciseId) || day?.exercises[0];

  const sessionId = useMemo(
    () => `${planId}-${dayId}-${selectedExercise?.id || "free-lens"}`,
    [planId, dayId, selectedExercise?.id],
  );

  const targetExerciseName = selectedExercise?.name || "Bicep Curl";
  const reps = aiResult?.reps || 0;
  const canFinish = reps >= 8;
  const fitUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("fitUser") || "null");
    } catch {
      return null;
    }
  })();

  const speak = (text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    if (!text || text === "Good form" || text === lastSpokenRef.current) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    lastSpokenRef.current = text;
  };

  const drawSkeleton = (landmarks: Landmark[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || canvas.clientWidth;
    canvas.height = video.videoHeight || canvas.clientHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(14, 165, 233, 0.95)";
    ctx.shadowColor = "rgba(14, 165, 233, 0.8)";
    ctx.shadowBlur = 16;

    POSE_CONNECTIONS.forEach(([start, end]) => {
      const a = landmarks[start];
      const b = landmarks[end];
      if (!a || !b || a.visibility < 0.35 || b.visibility < 0.35) return;
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    });

    ctx.shadowBlur = 10;
    landmarks.forEach((landmark) => {
      if (landmark.visibility < 0.4) return;
      ctx.beginPath();
      ctx.fillStyle = "rgba(251, 146, 60, 0.95)";
      ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const analyzeFrame = async (reset = false) => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas || !isActive || requestInFlight.current) return;
    if (!video.videoWidth || !video.videoHeight) return;

    requestInFlight.current = true;
    setIsAnalyzing(true);

    canvas.width = 512;
    canvas.height = Math.round((video.videoHeight / video.videoWidth) * 512);
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.72);

    try {
      const response = await fetch(`${API_URL}/ai/analyze-frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          exercise: targetExerciseName,
          session_id: sessionId,
          reset,
        }),
      });

      if (!response.ok) throw new Error("AI analysis failed");
      const data = (await response.json()) as AiResult;
      setAiResult(data);
      drawSkeleton(data.landmarks || []);

      if (data.correction) speak(data.correction);

      [8, 12, 15].forEach((milestone) => {
        if (data.reps >= milestone && !milestonesSpokenRef.current.has(milestone)) {
          milestonesSpokenRef.current.add(milestone);
          speak(`${milestone} reps done. Keep going strong.`);
        }
      });
    } catch (err) {
      setAiResult((current) => ({
        exercise: current?.exercise || "offline",
        display_name: current?.display_name || targetExerciseName,
        confidence: 0,
        reps: current?.reps || 0,
        stage: current?.stage || "ready",
        correction: "AI backend is not connected. Start the FastAPI server.",
        landmarks: [],
        tracked_angle: 0,
        ready: false,
      }));
    } finally {
      setIsAnalyzing(false);
      requestInFlight.current = false;
    }
  };

  useEffect(() => {
    if (!isActive) return;
    analyzeFrame(true);
    const interval = window.setInterval(() => analyzeFrame(false), 450);
    return () => window.clearInterval(interval);
  }, [isActive, sessionId, targetExerciseName]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!day || !selectedExercise) {
    return <div className="p-10 text-center">Workout not found.</div>;
  }

  const finishWorkout = async () => {
    const totalExercises = day?.exercises.length || 0;
    if (fitUser?.user_id) {
      try {
        await fetch(`${API_URL}/progress/exercise`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: fitUser.user_id,
            plan_id: planId,
            day_id: dayId,
            day_name: day?.name || "Workout Day",
            exercise_id: selectedExercise.id,
            exercise_name: selectedExercise.name,
            reps,
            completed: true,
            total_exercises: totalExercises,
          }),
        });
      } catch {
        // UI still continues even if progress sync fails.
      }
    }
    navigate(`/workout/${planId}/${dayId}?completed=${selectedExercise.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,0.28),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.92))] z-10 pointer-events-none" />

      <div className="absolute top-0 w-full z-30 p-5 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent">
        <button onClick={() => navigate(-1)} className="p-3 rounded-full bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-mono text-primary uppercase tracking-[0.35em]">
            Green FormFix Lens
          </p>
          <h2 className="font-heading text-2xl uppercase leading-none">{targetExerciseName}</h2>
        </div>
        <button
          onClick={() => setVoiceEnabled((value) => !value)}
          className={`p-3 rounded-full backdrop-blur-md ${
            voiceEnabled ? "bg-primary text-black" : "bg-white/10 text-white"
          }`}
        >
          <Mic2 className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
        {!isActive && (
          <div className="flex flex-col items-center gap-2 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-mono opacity-60 uppercase">
              {error || "Initializing AI Lens..."}
            </p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-20 pointer-events-none"
        />
        <canvas ref={captureCanvasRef} className="hidden" />
      </div>

      <div className="absolute top-28 left-5 right-5 z-30 grid grid-cols-3 gap-3">
        {[8, 12, 15].map((milestone) => (
          <div
            key={milestone}
            className={`rounded-2xl border p-3 backdrop-blur-xl ${
              reps >= milestone
                ? "border-primary bg-primary/20 text-primary"
                : "border-white/10 bg-black/35 text-white/55"
            }`}
          >
            <p className="font-heading text-2xl leading-none">{milestone}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest">Rep Reminder</p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 p-5 pb-8 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="glass-card-static p-5 border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono text-primary uppercase tracking-[0.28em]">
                Current Movement
              </p>
              <h3 className="text-3xl font-heading uppercase leading-none mt-1">
                {aiResult?.display_name || targetExerciseName}
              </h3>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={reps}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-right"
              >
                <p className="text-6xl font-heading text-primary leading-none">{reps}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Reps Done
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-white/5 p-3 border border-white/10">
              <p className="text-[9px] font-mono uppercase text-muted-foreground">Stage</p>
              <p className="font-heading text-xl uppercase">{aiResult?.stage || "Ready"}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 border border-white/10">
              <p className="text-[9px] font-mono uppercase text-muted-foreground">Angle</p>
              <p className="font-heading text-xl">{aiResult?.tracked_angle || 0}°</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 border border-white/10">
              <p className="text-[9px] font-mono uppercase text-muted-foreground">AI</p>
              <p className="font-heading text-xl">{isAnalyzing ? "Live" : "Ready"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 flex gap-3 items-start mb-4">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">
              {aiResult?.correction || "Get ready. I will count clean reps and correct your form."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-13 border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            {canFinish ? (
              <Button
                className="h-13 bg-primary text-black font-heading text-lg tracking-widest hover:bg-primary/90"
                onClick={finishWorkout}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finish
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-13 border-primary/30 bg-primary/10 text-primary"
                onClick={() => analyzeFrame(true)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
