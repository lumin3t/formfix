import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, ScanLine, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const ScanMeal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyGoal] = useState(2200);
  const [consumed, setConsumed] = useState(1480);
  const [scannedMeals, setScannedMeals] = useState([
    { id: "1", name: "Oatmeal with Banana", calories: 380, time: "8:00 AM" },
    { id: "2", name: "Grilled Chicken Wrap", calories: 520, time: "12:30 PM" },
    { id: "3", name: "Protein Shake", calories: 280, time: "3:00 PM" },
    { id: "4", name: "Rice & Vegetables", calories: 300, time: "6:00 PM" },
  ]);

  const remaining = dailyGoal - consumed;
  const progressPct = Math.min((consumed / dailyGoal) * 100, 100);

  const handleScan = () => {
    // Mock scan result
    const mockMeal = {
      id: Date.now().toString(),
      name: "Scanned: Mixed Salad Bowl",
      calories: Math.floor(Math.random() * 300) + 150,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setScannedMeals([...scannedMeals, mockMeal]);
    setConsumed(consumed + mockMeal.calories);
    toast({ title: `${mockMeal.name} - ${mockMeal.calories} cal added! 📷` });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-3xl text-foreground">MEAL SCANNER</h1>
      </div>

      {/* Calorie Ring */}
      <div className="px-5 mb-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Daily Goal</p>
              <p className="font-display text-4xl text-foreground">{dailyGoal} <span className="text-lg text-muted-foreground">cal</span></p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Remaining</p>
              <p className={`font-display text-4xl ${remaining > 0 ? "text-primary" : "text-destructive"}`}>
                {remaining} <span className="text-lg text-muted-foreground">cal</span>
              </p>
            </div>
          </div>

          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${progressPct >= 100 ? "bg-destructive" : "bg-primary"}`}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">{consumed} cal consumed</span>
            <span className="text-xs text-muted-foreground">{Math.round(progressPct)}%</span>
          </div>
        </div>
      </div>

      {/* Scan Button */}
      <div className="px-5 mb-6">
        <Button
          onClick={handleScan}
          className="w-full h-16 bg-primary text-primary-foreground font-display text-xl gap-3"
        >
          <Camera className="h-6 w-6" />
          SCAN YOUR MEAL
        </Button>
        <p className="text-center text-muted-foreground text-xs mt-2">
          Point camera at your meal to auto-detect calories
        </p>
      </div>

      {/* Today's Meals */}
      <div className="px-5">
        <h2 className="font-display text-xl text-foreground mb-3">TODAY'S MEALS</h2>
        <div className="space-y-2">
          {scannedMeals.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <ScanLine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">{meal.name}</p>
                  <p className="text-muted-foreground text-xs">{meal.time}</p>
                </div>
              </div>
              <span className="text-primary font-semibold text-sm">{meal.calories} cal</span>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ScanMeal;
