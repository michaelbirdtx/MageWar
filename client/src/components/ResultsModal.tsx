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
  playerResult: { effect: string; damage: number } | null;
  aiResult: { effect: string; damage: number } | null;
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
          <div className="bg-card border-2 border-border rounded-lg p-4 flex flex-col items-center" data-testid="result-card-player">
            <p className="text-sm text-muted-foreground mb-2">{playerName}</p>
            {playerResult ? (
              <>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-serif font-bold text-lg mb-1" data-testid="text-player-effect">{playerResult.effect}</h3>
                <p className="text-3xl font-bold text-destructive" data-testid="text-player-damage">-{playerResult.damage}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No spell cast</p>
            )}
          </div>

          {/* AI Spell Result */}
          <div className="bg-card border-2 border-border rounded-lg p-4 flex flex-col items-center" data-testid="result-card-ai">
            <p className="text-sm text-muted-foreground mb-2">{opponentName}</p>
            {aiResult ? (
              <>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-serif font-bold text-lg mb-1" data-testid="text-ai-effect">{aiResult.effect}</h3>
                <p className="text-3xl font-bold text-destructive" data-testid="text-ai-damage">-{aiResult.damage}</p>
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
