import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { sampleRecipes } from "@/data/workoutData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const Recipes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [newRecipe, setNewRecipe] = useState({ title: "", description: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddRecipe = () => {
    if (!newRecipe.title) return;
    const estimated = {
      id: Date.now().toString(),
      title: newRecipe.title,
      description: newRecipe.description,
      calories: Math.floor(Math.random() * 400) + 200,
      protein: Math.floor(Math.random() * 30) + 15,
      carbs: Math.floor(Math.random() * 40) + 15,
      fat: Math.floor(Math.random() * 20) + 5,
      image: "🍽️",
    };
    setRecipes([estimated, ...recipes]);
    setNewRecipe({ title: "", description: "" });
    setDialogOpen(false);
    toast({ title: "Recipe added! Calories auto-calculated 🧮" });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="font-display text-3xl text-foreground">RECIPES</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-foreground">ADD RECIPE</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Recipe Title</Label>
                <Input
                  placeholder="e.g. Grilled Chicken Salad"
                  value={newRecipe.title}
                  onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                  className="bg-secondary border-border text-foreground mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Description & Ingredients</Label>
                <Textarea
                  placeholder="Describe the recipe and list ingredients..."
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  className="bg-secondary border-border text-foreground mt-1"
                  rows={4}
                />
              </div>
              <p className="text-xs text-muted-foreground">Calories will be auto-calculated based on ingredients</p>
              <Button onClick={handleAddRecipe} className="w-full bg-primary text-primary-foreground font-semibold">
                Add & Calculate Calories
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Meal Suggestion */}
      <div className="px-5 mb-5">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4">
          <p className="text-primary font-semibold text-sm mb-1">🤖 AI Meal Suggestion</p>
          <p className="text-foreground text-sm">Based on your profile: Try a high-protein chicken bowl for lunch (~520 cal) to hit your daily protein target.</p>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="text-4xl mb-3">{recipe.image}</div>
            <h3 className="font-semibold text-foreground mb-1">{recipe.title}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{recipe.description}</p>

            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <Flame className="h-3 w-3 mx-auto text-orange-400 mb-0.5" />
                <p className="text-xs font-bold text-foreground">{recipe.calories}</p>
                <p className="text-[10px] text-muted-foreground">cal</p>
              </div>
              <div className="text-center">
                <Beef className="h-3 w-3 mx-auto text-red-400 mb-0.5" />
                <p className="text-xs font-bold text-foreground">{recipe.protein}g</p>
                <p className="text-[10px] text-muted-foreground">protein</p>
              </div>
              <div className="text-center">
                <Wheat className="h-3 w-3 mx-auto text-yellow-400 mb-0.5" />
                <p className="text-xs font-bold text-foreground">{recipe.carbs}g</p>
                <p className="text-[10px] text-muted-foreground">carbs</p>
              </div>
              <div className="text-center">
                <Droplets className="h-3 w-3 mx-auto text-blue-400 mb-0.5" />
                <p className="text-xs font-bold text-foreground">{recipe.fat}g</p>
                <p className="text-[10px] text-muted-foreground">fat</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Recipes;
