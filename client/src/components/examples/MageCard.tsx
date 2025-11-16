import MageCard from "../MageCard";

export default function MageCardExample() {
  const sampleMage = {
    id: "player1",
    name: "Aria Stormweaver",
    health: 75,
    maxHealth: 100,
    mana: 60,
    maxMana: 100,
    isPlayer: true,
  };
  
  return (
    <div className="p-4 max-w-sm">
      <MageCard mage={sampleMage} showTurnIndicator />
    </div>
  );
}
