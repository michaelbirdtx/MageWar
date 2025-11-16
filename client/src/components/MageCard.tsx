import { Mage } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MageCardProps {
  mage: Mage;
  showTurnIndicator?: boolean;
}

export default function MageCard({ mage, showTurnIndicator }: MageCardProps) {
  const healthPercent = (mage.health / mage.maxHealth) * 100;
  const manaPercent = (mage.mana / mage.maxMana) * 100;
  const initials = mage.name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  return (
    <Card className={`p-5 ${showTurnIndicator ? "border-primary border-2" : ""}`} data-testid={`card-mage-${mage.id}`}>
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-lg" data-testid={`text-mage-name-${mage.id}`}>{mage.name}</h3>
          <p className="text-sm text-muted-foreground">{mage.isPlayer ? "Player" : "Opponent"}</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-sm">
              <Heart className="w-4 h-4 text-destructive" />
              <span className="font-medium">Health</span>
            </div>
            <span className="text-sm font-semibold" data-testid={`text-health-${mage.id}`}>
              {mage.health} / {mage.maxHealth}
            </span>
          </div>
          <Progress value={healthPercent} className="h-3 bg-muted" />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">Mana</span>
            </div>
            <span className="text-sm font-semibold" data-testid={`text-mana-${mage.id}`}>
              {mage.mana} / {mage.maxMana}
            </span>
          </div>
          <Progress value={manaPercent} className="h-2 bg-muted [&>div]:bg-primary" />
        </div>
      </div>
      
      {showTurnIndicator && (
        <div className="mt-4 text-center">
          <div className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
            Current Turn
          </div>
        </div>
      )}
    </Card>
  );
}
