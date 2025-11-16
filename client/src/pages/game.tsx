import { useState, useEffect } from "react";
import { SpellComponent, GameState, Specialization } from "@shared/schema";
import ComponentLibrary from "@/components/ComponentLibrary";
import SpellBuilder from "@/components/SpellBuilder";
import BattleArena from "@/components/BattleArena";
import TutorialDialog from "@/components/TutorialDialog";
import CharacterCreator from "@/components/CharacterCreator";
import { Button } from "@/components/ui/button";
import { HelpCircle, Moon, Sun, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNewGame, castSpell, executeAITurn, deleteGame, CharacterData } from "@/lib/gameApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GamePage() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [spellComponents, setSpellComponents] = useState<SpellComponent[]>([]);
  const [castingSpell, setCastingSpell] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVictoryDialog, setShowVictoryDialog] = useState(false);
  const [showDefeatDialog, setShowDefeatDialog] = useState(false);
  const [showCharacterCreator, setShowCharacterCreator] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);
  
  
  useEffect(() => {
    if (gameState?.gamePhase === "victory") {
      setShowVictoryDialog(true);
    } else if (gameState?.gamePhase === "defeat") {
      setShowDefeatDialog(true);
    }
  }, [gameState?.gamePhase]);
  
  const initializeGame = async (characterData: CharacterData) => {
    try {
      setIsLoading(true);
      const { sessionId: newSessionId, gameState: newGameState } = await createNewGame(characterData);
      setSessionId(newSessionId);
      setGameState(newGameState);
      setShowCharacterCreator(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create game. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCharacterComplete = (characterData: CharacterData) => {
    initializeGame(characterData);
  };
  
  const handleCastSpell = async () => {
    if (!sessionId || !gameState) return;
    
    try {
      setIsLoading(true);
      const response = await castSpell(sessionId, spellComponents);
      
      // Show spell animation
      setCastingSpell({
        effect: response.spellResult.effect,
        damage: response.spellResult.damage,
        caster: "player",
        target: response.spellResult.target,
      });
      
      // Update game state after animation
      setTimeout(async () => {
        setGameState(response.gameState);
        setCastingSpell(null);
        setSpellComponents([]);
        
        // Check victory
        if (response.gameState.gamePhase === "victory") {
          return;
        }
        
        // Execute AI turn
        setTimeout(() => {
          handleAITurn();
        }, 1000);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cast spell",
        variant: "destructive",
      });
      setCastingSpell(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAITurn = async () => {
    if (!sessionId) return;
    
    try {
      const response = await executeAITurn(sessionId);
      
      if (response.aiPassed) {
        setGameState(response.gameState);
        toast({
          title: "AI Passed",
          description: "The opponent doesn't have enough mana to cast a spell",
        });
        return;
      }
      
      if (response.aiSpell) {
        // Show AI spell animation
        setCastingSpell({
          effect: response.aiSpell.effect,
          damage: response.aiSpell.damage,
          caster: "opponent",
          target: response.aiSpell.target,
        });
        
        setTimeout(() => {
          setGameState(response.gameState);
          setCastingSpell(null);
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to execute AI turn",
        variant: "destructive",
      });
      setCastingSpell(null);
    }
  };
  
  const handleNewGame = async () => {
    if (sessionId) {
      await deleteGame(sessionId);
    }
    setShowVictoryDialog(false);
    setShowDefeatDialog(false);
    setGameState(null);
    setSessionId(null);
    setShowCharacterCreator(true);
  };
  
  if (showCharacterCreator || !gameState) {
    return (
      <div className="min-h-screen bg-background">
        <CharacterCreator 
          open={showCharacterCreator && !isLoading} 
          onComplete={handleCharacterComplete} 
        />
        {isLoading && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Initializing game...</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-serif font-bold text-3xl" data-testid="text-game-title">Mage War</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewGame}
              data-testid="button-new-game"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTutorial(true)}
              data-testid="button-help"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Game Area */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Component Library */}
          <div className="lg:col-span-1">
            <ComponentLibrary onComponentSelect={(comp) => console.log("Selected:", comp)} />
          </div>
          
          {/* Spell Builder */}
          <div className="lg:col-span-1">
            <SpellBuilder
              components={spellComponents}
              onComponentsChange={setSpellComponents}
              onCastSpell={handleCastSpell}
              onClearSpell={() => setSpellComponents([])}
              playerMana={gameState.player.mana}
            />
          </div>
          
          {/* Battle Arena */}
          <div className="lg:col-span-1">
            <BattleArena
              player={gameState.player}
              opponent={gameState.opponent}
              currentTurn={gameState.currentTurn}
              castingSpell={castingSpell}
            />
          </div>
        </div>
      </main>
      
      {/* Tutorial */}
      <TutorialDialog open={showTutorial} onClose={() => setShowTutorial(false)} />
      
      {/* Victory Dialog */}
      <AlertDialog open={showVictoryDialog} onOpenChange={setShowVictoryDialog}>
        <AlertDialogContent data-testid="dialog-victory">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Victory!</AlertDialogTitle>
            <AlertDialogDescription>
              You have defeated the Dark Sorcerer! Your mastery of spell-crafting is unmatched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNewGame} data-testid="button-victory-new-game">
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Defeat Dialog */}
      <AlertDialog open={showDefeatDialog} onOpenChange={setShowDefeatDialog}>
        <AlertDialogContent data-testid="dialog-defeat">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Defeat</AlertDialogTitle>
            <AlertDialogDescription>
              The Dark Sorcerer has proven too powerful. Study your spell-craft and try again!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNewGame} data-testid="button-defeat-new-game">
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
