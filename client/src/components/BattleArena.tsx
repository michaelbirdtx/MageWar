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
  playerSpellLocked?: boolean;
  aiSpellLocked?: boolean;
  simultaneousResults?: {
    player: { effect: string; damage: number } | null;
    ai: { effect: string; damage: number } | null;
  } | null;
}

export default function BattleArena({ player, opponent, currentTurn, castingSpell, playerSpellLocked, aiSpellLocked, simultaneousResults }: BattleArenaProps) {
  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="font-serif font-semibold text-xl" data-testid="text-arena-title">Battle Arena</h2>
      
      <div className="flex-1 flex flex-col gap-6">
        <MageCard mage={opponent} showTurnIndicator={currentTurn === "opponent"} spellLocked={aiSpellLocked} />
        
        <div className="flex-1 flex items-center justify-center min-h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 relative overflow-hidden">
          <AnimatePresence>
            {simultaneousResults ? (
              <div className="w-full h-full flex gap-2 p-4">
                {/* AI Spell Result */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 bg-card border-2 border-border rounded-lg p-4 flex flex-col items-center justify-center"
                  data-testid="result-box-ai"
                >
                  <p className="text-sm text-muted-foreground mb-2">{opponent.name}</p>
                  {simultaneousResults.ai ? (
                    <>
                      <Zap className="w-8 h-8 text-primary mb-2" />
                      <h3 className="font-serif font-bold text-lg mb-1" data-testid="text-ai-effect">{simultaneousResults.ai.effect}</h3>
                      <p className="text-3xl font-bold text-destructive" data-testid="text-ai-damage">-{simultaneousResults.ai.damage}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Passed</p>
                  )}
                </motion.div>
                
                {/* Player Spell Result */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 bg-card border-2 border-border rounded-lg p-4 flex flex-col items-center justify-center"
                  data-testid="result-box-player"
                >
                  <p className="text-sm text-muted-foreground mb-2">{player.name}</p>
                  {simultaneousResults.player ? (
                    <>
                      <Zap className="w-8 h-8 text-primary mb-2" />
                      <h3 className="font-serif font-bold text-lg mb-1" data-testid="text-player-effect">{simultaneousResults.player.effect}</h3>
                      <p className="text-3xl font-bold text-destructive" data-testid="text-player-damage">-{simultaneousResults.player.damage}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No spell</p>
                  )}
                </motion.div>
              </div>
            ) : castingSpell ? (
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
        
        <MageCard mage={player} showTurnIndicator={currentTurn === "player"} spellLocked={playerSpellLocked} />
      </div>
    </div>
  );
}
