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
        
        <MageCard mage={player} showTurnIndicator={currentTurn === "player"} spellLocked={playerSpellLocked} />
      </div>
    </div>
  );
}
