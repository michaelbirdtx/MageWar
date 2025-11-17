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
  isDragging?: boolean;
}

export default function ComponentCard({
  component,
  onDragStart,
  isDragging,
}: ComponentCardProps) {
  const elementColor = ELEMENT_COLORS[component.element];
  const elementBg = ELEMENT_BG_COLORS[component.element];
  const elementBorder = ELEMENT_BORDER_COLORS[component.element];

  return (
    <Card
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, component)}
      className={`p-4 cursor-grab active:cursor-grabbing transition-all hover-elevate ${elementBg} border-2 ${elementBorder} ${isDragging ? "opacity-60" : ""}`}
      data-testid={`card-component-${component.id}`}
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
          <span className="text-xs font-bold text-primary">
            {component.manaCost} Mana
          </span>
        </div>
      </div>
    </Card>
  );
}
