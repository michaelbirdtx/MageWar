import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface ResultsModalProps {
  open: boolean;
  onNextRound: () => void;
  playerName: string;
  opponentName: string;
  playerResult: { effect: string; damage: number; shieldPower?: number; healingPower?: number; bonus?: number } | null;
  aiResult: { effect: string; damage: number; shieldPower?: number; healingPower?: number; bonus?: number } | null;
}

export default function ResultsModal({
  open,
  onNextRound,
  playerName,
  opponentName,
  playerResult,
  aiResult,
}: ResultsModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideClose data-testid="modal-results">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">Round Results</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {/* Player Spell Result */}
          <div className={`border-2 rounded-lg p-4 flex flex-col items-center ${
            playerResult?.bonus && playerResult.bonus > 0 
              ? "bg-purple-500/10 border-purple-500/30" 
              : "bg-card border-border"
          }`} data-testid="result-card-player">
            <p className="text-sm text-muted-foreground mb-2">{playerName}</p>
            {playerResult ? (
              <>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-serif font-bold text-lg mb-1" data-testid="text-player-effect">
                  {playerResult.effect}
                </h3>
                {playerResult.bonus && playerResult.bonus > 0 && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-2">
                    ✨ +{playerResult.bonus} Creative Bonus!
                  </p>
                )}
                <div className="flex gap-4 text-center">
                  {playerResult.damage > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Damage</p>
                      <p className="text-2xl font-bold text-destructive" data-testid="text-player-damage">
                        {playerResult.damage}
                      </p>
                    </div>
                  )}
                  {playerResult.shieldPower && playerResult.shieldPower > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Shield</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-player-shield">
                        {playerResult.shieldPower}
                      </p>
                    </div>
                  )}
                  {playerResult.healingPower && playerResult.healingPower > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Healing</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-player-healing">
                        {playerResult.healingPower}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No spell cast</p>
            )}
          </div>

          {/* AI Spell Result */}
          <div className={`border-2 rounded-lg p-4 flex flex-col items-center ${
            aiResult?.bonus && aiResult.bonus > 0 
              ? "bg-purple-500/10 border-purple-500/30" 
              : "bg-card border-border"
          }`} data-testid="result-card-ai">
            <p className="text-sm text-muted-foreground mb-2">{opponentName}</p>
            {aiResult ? (
              <>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-serif font-bold text-lg mb-1" data-testid="text-ai-effect">
                  {aiResult.effect}
                </h3>
                {aiResult.bonus && aiResult.bonus > 0 && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-2">
                    ✨ +{aiResult.bonus} Creative Bonus!
                  </p>
                )}
                <div className="flex gap-4 text-center">
                  {aiResult.damage > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Damage</p>
                      <p className="text-2xl font-bold text-destructive" data-testid="text-ai-damage">
                        {aiResult.damage}
                      </p>
                    </div>
                  )}
                  {aiResult.shieldPower && aiResult.shieldPower > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Shield</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-ai-shield">
                        {aiResult.shieldPower}
                      </p>
                    </div>
                  )}
                  {aiResult.healingPower && aiResult.healingPower > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Healing</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-ai-healing">
                        {aiResult.healingPower}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Passed</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onNextRound} className="w-full" data-testid="button-next-round">
            Next Round
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
