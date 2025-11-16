import { useState, useEffect } from "react";
import { SpellComponent, Mage } from "@shared/schema";
import ComponentLibrary from "@/components/ComponentLibrary";
import SpellBuilder from "@/components/SpellBuilder";
import BattleArena from "@/components/BattleArena";
import TutorialDialog from "@/components/TutorialDialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Moon, Sun } from "lucide-react";
import { calculateSpellPower } from "@/lib/gameData";
import { useToast } from "@/hooks/use-toast";

export default function GamePage() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [spellComponents, setSpellComponents] = useState<SpellComponent[]>([]);
  const [castingSpell, setCastingSpell] = useState<any>(null);
  const { toast } = useToast();
  
  //todo: remove mock functionality - Initial game state with mock data
  const [player, setPlayer] = useState<Mage>({
    id: "player1",
    name: "Aria Stormweaver",
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    isPlayer: true,
  });
  
  //todo: remove mock functionality - AI opponent mock data
  const [opponent, setOpponent] = useState<Mage>({
    id: "opponent1",
    name: "Dark Sorcerer",
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    isPlayer: false,
  });
  
  const [currentTurn, setCurrentTurn] = useState<"player" | "opponent">("player");
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);
  
  const handleCastSpell = () => {
    const { damage, manaCost, effect } = calculateSpellPower(spellComponents);
    
    if (manaCost > player.mana) {
      toast({
        title: "Not enough mana!",
        description: `You need ${manaCost} mana but only have ${player.mana}`,
        variant: "destructive",
      });
      return;
    }
    
    // Show spell animation
    setCastingSpell({
      effect,
      damage,
      caster: "player",
    });
    
    // Apply damage and mana cost
    setTimeout(() => {
      setOpponent(prev => ({
        ...prev,
        health: Math.max(0, prev.health - damage),
      }));
      setPlayer(prev => ({
        ...prev,
        mana: prev.mana - manaCost,
      }));
      setCastingSpell(null);
      setSpellComponents([]);
      
      // Check victory
      if (opponent.health - damage <= 0) {
        toast({
          title: "Victory!",
          description: "You have defeated the Dark Sorcerer!",
        });
        return;
      }
      
      // AI turn
      setTimeout(() => {
        handleAITurn();
      }, 1000);
    }, 2000);
  };
  
  //todo: remove mock functionality - Simple AI behavior
  const handleAITurn = () => {
    setCurrentTurn("opponent");
    
    setTimeout(() => {
      const aiDamage = Math.floor(Math.random() * 30) + 15;
      const aiManaCost = Math.floor(Math.random() * 25) + 15;
      
      setCastingSpell({
        effect: "Shadow Bolt",
        damage: aiDamage,
        caster: "opponent",
      });
      
      setTimeout(() => {
        setPlayer(prev => ({
          ...prev,
          health: Math.max(0, prev.health - aiDamage),
        }));
        setOpponent(prev => ({
          ...prev,
          mana: Math.min(prev.maxMana, prev.mana - aiManaCost + 20),
        }));
        setCastingSpell(null);
        setCurrentTurn("player");
        
        // Restore some mana to player
        setPlayer(prev => ({
          ...prev,
          mana: Math.min(prev.maxMana, prev.mana + 15),
        }));
        
        // Check defeat
        if (player.health - aiDamage <= 0) {
          toast({
            title: "Defeat",
            description: "The Dark Sorcerer has won...",
            variant: "destructive",
          });
        }
      }, 2000);
    }, 1500);
  };
  
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
              playerMana={player.mana}
            />
          </div>
          
          {/* Battle Arena */}
          <div className="lg:col-span-1">
            <BattleArena
              player={player}
              opponent={opponent}
              currentTurn={currentTurn}
              castingSpell={castingSpell}
            />
          </div>
        </div>
      </main>
      
      {/* Tutorial */}
      <TutorialDialog open={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  );
}
