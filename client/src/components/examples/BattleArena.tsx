import { useState } from "react";
import BattleArena from "../BattleArena";
import { Button } from "@/components/ui/button";

export default function BattleArenaExample() {
  const [castingSpell, setCastingSpell] = useState<any>(null);
  
  const player = {
    id: "player1",
    name: "Aria Stormweaver",
    health: 75,
    maxHealth: 100,
    mana: 60,
    maxMana: 100,
    isPlayer: true,
  };
  
  const opponent = {
    id: "opponent1",
    name: "Dark Sorcerer",
    health: 50,
    maxHealth: 100,
    mana: 80,
    maxMana: 100,
    isPlayer: false,
  };
  
  const triggerSpell = () => {
    setCastingSpell({
      effect: "Fireball",
      damage: 35,
      caster: "player",
    });
    setTimeout(() => setCastingSpell(null), 2000);
  };
  
  return (
    <div className="p-4 max-w-md">
      <BattleArena
        player={player}
        opponent={opponent}
        currentTurn="player"
        castingSpell={castingSpell}
      />
      <Button onClick={triggerSpell} className="mt-4 w-full">
        Test Spell Animation
      </Button>
    </div>
  );
}
