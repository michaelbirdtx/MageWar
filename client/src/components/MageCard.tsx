import { Mage } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Sparkles, Flame, Droplet, Brain, Activity, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MageCardProps {
  mage: Mage;
  showTurnIndicator?: boolean;
  spellLocked?: boolean;
}

export default function MageCard({ mage, showTurnIndicator, spellLocked }: MageCardProps) {
  const healthPercent = (mage.health / mage.maxHealth) * 100;
  const manaPercent = (mage.mana / mage.maxMana) * 100;
  const initials = mage.name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  const specializationIcon = mage.specialization === "pyromancer" ? (
    <Flame className="w-3 h-3" />
  ) : (
    <Droplet className="w-3 h-3" />
  );
  
  const specializationColor = mage.specialization === "pyromancer" 
    ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
    : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700";
  
  return (
    <Card 
      className={`p-5 ${showTurnIndicator ? "border-primary border-2" : ""} ${spellLocked ? "bg-green-500/20 dark:bg-green-900/20 border-green-500 border-2" : ""}`} 
      data-testid={`card-mage-${mage.id}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-lg" data-testid={`text-mage-name-${mage.id}`}>{mage.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="outline" 
              className={`text-xs ${specializationColor}`}
              data-testid={`badge-specialization-${mage.id}`}
            >
              {specializationIcon}
              <span className="ml-1 capitalize">{mage.specialization}</span>
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs" data-testid={`stat-intellect-${mage.id}`}>
              <Brain className="w-3 h-3 text-purple-500" />
              <span className="font-semibold">{mage.intellect}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Intellect (Max Mana)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs" data-testid={`stat-stamina-${mage.id}`}>
              <Activity className="w-3 h-3 text-green-500" />
              <span className="font-semibold">{mage.stamina}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Stamina (Max Health)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs" data-testid={`stat-wisdom-${mage.id}`}>
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span className="font-semibold">{mage.wisdom}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Wisdom (Mana Regen: +{mage.manaRegen}/turn)</TooltipContent>
        </Tooltip>
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
