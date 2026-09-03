import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Info, Utensils, FlaskConical, Salad } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FoodLabRescueGameProps {
  onComplete: () => void;
}

export const FoodLabRescueGame: React.FC<FoodLabRescueGameProps> = ({ onComplete }) => {
  // Balanced Diet Components (Target: 1 Carb, 1 Protein, 1 Vitamin/Mineral, 1 Healthy Fat)
  const [selectedPlate, setSelectedPlate] = useState<{
    carb?: string;
    protein?: string;
    vitamin?: string;
    fat?: string;
  }>({});

  // Virtual Iodine Starch & Biuret Protein Reagent Tests
  const [iodineTestDone, setIodineTestDone] = useState(false);
  const [biuretTestDone, setBiuretTestDone] = useState(false);

  const [feedback, setFeedback] = useState<string>(
    'Nutritional Lab Mission: Assemble a balanced school thali with all 4 essential food nutrient groups, and perform reagent tests (Iodine for Starch & Biuret for Protein)!'
  );

  const isBalancedThali = Boolean(
    selectedPlate.carb && selectedPlate.protein && selectedPlate.vitamin && selectedPlate.fat
  );

  const isMissionComplete = isBalancedThali && iodineTestDone && biuretTestDone;

  return (
    <div className="space-y-4 select-none">
      {/* Top Narrative HUD */}
      <div className="rounded-3xl border border-orange-200/80 dark:border-orange-900/60 bg-gradient-to-br from-orange-50 via-amber-50/40 to-rose-50 dark:from-slate-900 dark:via-orange-950/20 dark:to-rose-950/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-3xl shadow-inner">
            🥗
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-700 block">
              Chapter 3 · Mindful Eating: Balanced Diet & Nutrients
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Food Laboratory & Nutrient Testing
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Formulate a balanced Indian thali and conduct chemical reagent tests for <strong>Starch</strong> and <strong>Protein</strong>!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-orange-200 text-xs font-extrabold text-orange-800 dark:text-orange-200 shadow-2xs">
          <Salad className="h-4 w-4 text-orange-600" />
          <span>Plate Groups: {Object.keys(selectedPlate).length} / 4</span>
        </div>
      </div>

      {/* 2D NUTRITIONAL KITCHEN & REAGENT BENCH */}
      <div className="relative rounded-3xl border-4 border-orange-400/90 dark:border-orange-700/80 bg-[#FFF7ED] dark:bg-[#1A1614] overflow-hidden shadow-2xl h-[420px] sm:h-[460px] p-6 flex flex-col justify-between">
        {/* Top: Balanced Thali Plate Formulation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10">
          {/* Carbohydrates Slot */}
          <div className="p-3 rounded-2xl bg-white dark:bg-card-dark border-2 border-amber-300 shadow-sm text-center">
            <span className="text-[9px] font-black uppercase text-amber-700 block">1. Carbohydrates</span>
            <span className="text-xl my-1 block">{selectedPlate.carb ? '🍚 Rice & Roti' : '❓'}</span>
            <Button
              size="sm"
              variant={selectedPlate.carb ? 'outline' : 'gradient'}
              onClick={() => {
                setSelectedPlate((p) => ({ ...p, carb: 'Whole Wheat Roti & Rice' }));
                setFeedback('🌾 Carbohydrates added: Provides instant metabolic energy!');
              }}
              className="text-[10px] h-6 px-2 w-full font-bold cursor-pointer"
            >
              {selectedPlate.carb ? 'Carb Added ✓' : '+ Add Rice/Roti'}
            </Button>
          </div>

          {/* Proteins Slot */}
          <div className="p-3 rounded-2xl bg-white dark:bg-card-dark border-2 border-amber-300 shadow-sm text-center">
            <span className="text-[9px] font-black uppercase text-amber-700 block">2. Proteins</span>
            <span className="text-xl my-1 block">{selectedPlate.protein ? '🍲 Dal & Paneer' : '❓'}</span>
            <Button
              size="sm"
              variant={selectedPlate.protein ? 'outline' : 'gradient'}
              onClick={() => {
                setSelectedPlate((p) => ({ ...p, protein: 'Lentils Dal & Paneer' }));
                setFeedback('🍲 Protein added: Essential for muscle building and cell repair!');
              }}
              className="text-[10px] h-6 px-2 w-full font-bold cursor-pointer"
            >
              {selectedPlate.protein ? 'Protein Added ✓' : '+ Add Dal/Paneer'}
            </Button>
          </div>

          {/* Vitamins & Minerals Slot */}
          <div className="p-3 rounded-2xl bg-white dark:bg-card-dark border-2 border-amber-300 shadow-sm text-center">
            <span className="text-[9px] font-black uppercase text-amber-700 block">3. Vitamins/Minerals</span>
            <span className="text-xl my-1 block">{selectedPlate.vitamin ? '🥬 Spinach & Carrots' : '❓'}</span>
            <Button
              size="sm"
              variant={selectedPlate.vitamin ? 'outline' : 'gradient'}
              onClick={() => {
                setSelectedPlate((p) => ({ ...p, vitamin: 'Spinach & Fresh Vegetables' }));
                setFeedback('🥬 Vitamins & Minerals added: Protects against deficiency diseases!');
              }}
              className="text-[10px] h-6 px-2 w-full font-bold cursor-pointer"
            >
              {selectedPlate.vitamin ? 'Vitamins Added ✓' : '+ Add Green Veggies'}
            </Button>
          </div>

          {/* Healthy Fats Slot */}
          <div className="p-3 rounded-2xl bg-white dark:bg-card-dark border-2 border-amber-300 shadow-sm text-center">
            <span className="text-[9px] font-black uppercase text-amber-700 block">4. Healthy Fats</span>
            <span className="text-xl my-1 block">{selectedPlate.fat ? '🧈 Pure Ghee & Nuts' : '❓'}</span>
            <Button
              size="sm"
              variant={selectedPlate.fat ? 'outline' : 'gradient'}
              onClick={() => {
                setSelectedPlate((p) => ({ ...p, fat: 'Pure Cow Ghee & Almonds' }));
                setFeedback('🧈 Healthy Fats added: Provides concentrated energy reserve and insulation!');
              }}
              className="text-[10px] h-6 px-2 w-full font-bold cursor-pointer"
            >
              {selectedPlate.fat ? 'Fats Added ✓' : '+ Add Ghee/Nuts'}
            </Button>
          </div>
        </div>

        {/* Bottom: Virtual Chemical Reagent Testing Workbench */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 z-10">
          {/* Iodine Starch Test */}
          <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border-2 border-orange-300 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-orange-700 block">
                🧪 Test A: Iodine Reagent (Starch Detection)
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {iodineTestDone ? 'Result: Starch turned Blue-Black colour!' : 'Drop dilute iodine on potato slice.'}
              </p>
            </div>
            <Button
              size="sm"
              variant={iodineTestDone ? 'outline' : 'gradient'}
              disabled={iodineTestDone}
              onClick={() => {
                setIodineTestDone(true);
                setFeedback('✨ Iodine Test Positive! Adding Iodine drops turned the carbohydrate/starch sample into a characteristic Blue-Black colour!');
              }}
              className="text-xs font-bold cursor-pointer shrink-0"
            >
              {iodineTestDone ? 'Blue-Black ✓' : 'Drop Iodine 🧪'}
            </Button>
          </div>

          {/* Biuret Protein Test */}
          <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border-2 border-orange-300 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-orange-700 block">
                🧪 Test B: Copper Sulphate & Caustic Soda (Biuret Protein)
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {biuretTestDone ? 'Result: Protein turned Violet colour!' : 'Test crushed egg white / gram flour.'}
              </p>
            </div>
            <Button
              size="sm"
              variant={biuretTestDone ? 'outline' : 'gradient'}
              disabled={biuretTestDone}
              onClick={() => {
                setBiuretTestDone(true);
                setFeedback('✨ Biuret Test Positive! Copper Sulphate + Caustic Soda reacted with peptide bonds to produce a distinct Violet colour indicating Protein!');
              }}
              className="text-xs font-bold cursor-pointer shrink-0"
            >
              {biuretTestDone ? 'Violet Colour ✓' : 'Add Biuret 🧪'}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Science Feedback Banner */}
      <div className="rounded-2xl bg-orange-50 dark:bg-gray-800/80 border border-orange-200 p-3.5 text-xs font-medium text-orange-950 dark:text-orange-200 flex items-center gap-2">
        <Info className="h-4 w-4 text-orange-600 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Completion Modal */}
      {isMissionComplete && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
          <div className="text-4xl">🥗🧪🎉</div>
          <h3 className="text-lg font-black text-emerald-900">
            Balanced Nutrition & Chemical Reagent Testing Mastered!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You successfully assembled a balanced Indian diet containing all 4 macronutrients and conducted Iodine (Blue-Black for Starch) and Biuret (Violet for Protein) tests (+40 XP · ⭐ 1 Star).
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={onComplete}
            rightIcon={<Sparkles className="h-4 w-4" />}
            className="font-bold shadow-md cursor-pointer"
          >
            Complete Food Lab Mission →
          </Button>
        </motion.div>
      )}
    </div>
  );
};
