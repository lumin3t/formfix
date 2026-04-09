//src/pages/Camera.tsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { pushPullLegPlan, highVolumeSplitPlan } from "@/data/workoutData";

const Camera = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { videoRef, isActive } = useCamera();

  // Data Lookup
  const plan = searchParams.get("plan") === "ppl" ? pushPullLegPlan : highVolumeSplitPlan;
  const day = plan?.days.find(d => d.id === searchParams.get("day"));

  if (!day) return <div className="p-10 text-center">Workout not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header UI */}
      <div className="absolute top-0 w-full z-20 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate(-1)} className="p-3 rounded-full bg-white/10 backdrop-blur-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="font-heading text-xl uppercase leading-none">{day.name}</h2>
          <p className="text-[10px] font-mono text-primary mt-1 uppercase tracking-widest">{day.focus}</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Video Feed */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
        {!isActive && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-mono opacity-50 uppercase">Initializing Lens...</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 left-6 right-6 z-20 p-5 glass-card backdrop-blur-xl border-white/10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-mono text-primary mb-1 uppercase tracking-tighter">Current Movement</p>
            <h3 className="text-2xl font-heading uppercase">{day.exercises[0].name}</h3>
          </div>
          <p className="text-2xl font-heading">{day.exercises[0].sets}×{day.exercises[0].reps}</p>
        </div>
      </div>
    </div>
  );
};

export default Camera;