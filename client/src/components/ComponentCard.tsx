import { SpellComponent } from "@shared/schema";
import ElementIcon from "./ElementIcon";
import {
  ELEMENT_COLORS,
  ELEMENT_BG_COLORS,
  ELEMENT_BORDER_COLORS,
} from "@/lib/gameData";
import { Card } from "@/components/ui/card";

interface ComponentCardProps {
  component: SpellComponent;
  onDragStart?: (e: React.DragEvent, component: SpellComponent) => void;
  onClick?: () => void;
  isDragging?: boolean;
  isUsed?: boolean;
  isSelected?: boolean;
  isTouchMode?: boolean;
}

export default function ComponentCard({
  component,
  onDragStart,
  onClick,
  isDragging,
  isUsed,
  isSelected,
  isTouchMode,
}: ComponentCardProps) {
  const elementColor = ELEMENT_COLORS[component.element];
  const elementBg = ELEMENT_BG_COLORS[component.element];
  const elementBorder = ELEMENT_BORDER_COLORS[component.element];
  
  const handleDragStart = (e: React.DragEvent) => {
    if (isUsed) {
      e.preventDefault();
      return;
    }
    onDragStart?.(e, component);
  };
  
  const handleClick = () => {
    if (!isUsed && onClick) {
      onClick();
    }
  };

  return (
    <Card
      draggable={!!onDragStart && !isUsed && !isTouchMode}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`p-4 transition-all border-2 select-none touch-manipulation ${elementBorder} ${
        isUsed 
          ? "opacity-40 cursor-not-allowed grayscale" 
          : isTouchMode 
            ? "cursor-pointer active:scale-[0.98]" 
            : "cursor-grab active:cursor-grabbing hover-elevate"
      } ${elementBg} ${isDragging ? "opacity-60" : ""} ${
        isSelected ? "ring-2 ring-primary ring-offset-2 scale-[1.02]" : ""
      }`}
      data-testid={`card-component-${component.id}`}
      data-is-used={isUsed ? "true" : "false"}
      data-is-selected={isSelected ? "true" : "false"}
      data-component-id={component.id}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ElementIcon
            element={component.element}
            className={`w-5 h-5 ${elementColor}`}
          />
          <span className={`font-semibold text-sm ${elementColor}`}>
            {component.name}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{component.description}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-medium bg-card px-2 py-1 rounded-md border">
            {component.type}
          </span>
          <div className="flex items-center gap-2">
            {component.baseDamage > 0 && (
              <span className="text-xs font-bold text-destructive" data-testid={`stat-damage-${component.id}`}>
                DMG: {component.baseDamage}
              </span>
            )}
            {component.damageMultiplier > 1 && (
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400" data-testid={`stat-multiplier-${component.id}`}>
                x{component.damageMultiplier}
              </span>
            )}
            {component.rarity && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                component.rarity === "rare" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                component.rarity === "uncommon" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
              }`} data-testid={`stat-rarity-${component.id}`}>
                {component.rarity}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
