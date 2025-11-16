import { Mage } from "@shared/schema";
import MageCard from "./MageCard";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface BattleArenaProps {
  player: Mage;
  opponent: Mage;
  currentTurn: "player" | "opponent";
  castingSpell?: {
    effect: string;
    damage: number;
    caster: "player" | "opponent";
  } | null;
}

export default function BattleArena({ player, opponent, currentTurn, castingSpell }: BattleArenaProps) {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="font-serif font-semibold text-xl" data-testid="text-arena-title">Battle Arena</h2>
      
      <div className="flex-1 flex flex-col gap-6">
        <MageCard mage={opponent} showTurnIndicator={currentTurn === "opponent"} />
        
        <div className="flex-1 flex items-center justify-center min-h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 relative overflow-hidden">
          <AnimatePresence>
            {castingSpell ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <Zap className="w-16 h-16 text-primary" />
                </motion.div>
                <h3 className="font-serif font-bold text-2xl mb-2" data-testid="text-casting-effect">{castingSpell.effect}</h3>
                <p className="text-4xl font-bold text-destructive" data-testid="text-casting-damage">-{castingSpell.damage}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {castingSpell.caster === "player" ? player.name : opponent.name} casts!
                </p>
              </motion.div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Spell effects appear here</p>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <MageCard mage={player} showTurnIndicator={currentTurn === "player"} />
      </div>
    </div>
  );
}
