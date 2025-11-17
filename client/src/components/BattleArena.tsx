import { Mage } from "@shared/schema";
import MageCard from "./MageCard";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface BattleArenaProps {
  player: Mage;
  opponent: Mage;
  currentTurn: "player" | "opponent";
  playerSpellLocked?: boolean;
  aiSpellLocked?: boolean;
}

export default function BattleArena({ player, opponent, currentTurn, playerSpellLocked, aiSpellLocked }: BattleArenaProps) {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="font-serif font-semibold text-xl" data-testid="text-arena-title">Battle Arena</h2>
      
      <div className="flex-1 flex flex-col gap-6">
        <MageCard mage={opponent} showTurnIndicator={currentTurn === "opponent"} spellLocked={aiSpellLocked} />
        
        <div className="flex-1 flex items-center justify-center min-h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 relative overflow-hidden">
          <div className="text-center text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Combat in progress...</p>
          </div>
        </div>
        
        <MageCard mage={player} showTurnIndicator={currentTurn === "player"} spellLocked={playerSpellLocked} />
      </div>
    </div>
  );
}
