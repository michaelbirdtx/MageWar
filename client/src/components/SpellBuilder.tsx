import { useState } from "react";
import { SpellComponent, Specialization } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles, X } from "lucide-react";
import ElementIcon from "./ElementIcon";
import { ELEMENT_COLORS, ELEMENT_BG_COLORS, ELEMENT_BORDER_COLORS, calculateSpellPower, applySpecializationBonus } from "@/lib/gameData";

interface SpellBuilderProps {
  components: SpellComponent[];
  onComponentsChange: (components: SpellComponent[]) => void;
  onCastSpell: () => void;
  onClearSpell: () => void;
  playerMana: number;
  playerSpecialization: Specialization;
}

export default function SpellBuilder({
  components,
  onComponentsChange,
  onCastSpell,
  onClearSpell,
  playerMana,
  playerSpecialization,
}: SpellBuilderProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverChild, setDragOverChild] = useState<string | null>(null);
  
  const spellStats = calculateSpellPower(components);
  const baseDamage = spellStats.damage;
  const baseManaCost = spellStats.manaCost;
  
  // Apply specialization bonus
  const { damage, manaCost, damageBonus, costReduction } = applySpecializationBonus(
    components,
    baseDamage,
    baseManaCost,
    playerSpecialization
  );
  
  const { effect, target, validationError } = spellStats;
  const canCast = components.length > 0 && manaCost <= playerMana && !validationError;
  
  const specializationName = playerSpecialization === "pyromancer" ? "Pyromancer" : "Aquamancer";
  
  const handleDrop = (e: React.DragEvent, parentId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const componentData = e.dataTransfer.getData("application/json");
    if (!componentData) return;
    
    const newComponent: SpellComponent = JSON.parse(componentData);
    newComponent.id = `${newComponent.id}-${Date.now()}`;
    
    if (parentId) {
      const updatedComponents = components.map(comp => {
        if (comp.id === parentId && comp.type === "container") {
          // Limit containers to 4 children max
          if ((comp.children || []).length >= 4) {
            return comp;
          }
          return {
            ...comp,
            children: [...(comp.children || []), newComponent],
          };
        }
        return comp;
      });
      onComponentsChange(updatedComponents);
    } else {
      onComponentsChange([...components, newComponent]);
    }
    
    setDragOverIndex(null);
    setDragOverChild(null);
  };
  
  const handleDragOver = (e: React.DragEvent, index?: number, parentId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (index !== undefined) setDragOverIndex(index);
    if (parentId) setDragOverChild(parentId);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverIndex(null);
      setDragOverChild(null);
    }
  };
  
  const removeComponent = (componentId: string, parentId?: string) => {
    if (parentId) {
      const updatedComponents = components.map(comp => {
        if (comp.id === parentId) {
          return {
            ...comp,
            children: comp.children?.filter(c => c.id !== componentId),
          };
        }
        return comp;
      });
      onComponentsChange(updatedComponents);
    } else {
      onComponentsChange(components.filter(c => c.id !== componentId));
    }
  };
  
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-semibold text-xl" data-testid="text-builder-title">Spell Builder</h2>
        {components.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSpell}
            data-testid="button-clear-spell"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
      
      <Card
        className={`min-h-80 p-6 border-2 transition-all ${
          components.length === 0 
            ? "border-dashed border-muted-foreground/30" 
            : "border-primary/50"
        } ${dragOverIndex === null && dragOverChild === null ? "" : "border-primary"}`}
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={handleDragLeave}
        data-testid="container-spell-builder"
      >
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Sparkles className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">Drag components here to build your spell</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {components.map((component, index) => (
              <ComponentInBuilder
                key={component.id}
                component={component}
                removeComponent={removeComponent}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                isDragOver={dragOverChild === component.id}
              />
            ))}
          </div>
        )}
      </Card>
      
      {components.length > 0 && (
        <Card className="p-4 bg-muted/30">
          {validationError && (
            <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-xs text-destructive font-medium">{validationError}</p>
            </div>
          )}
          {target === "self" && !validationError && damage > 0 && (
            <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                Warning: This spell will damage YOU for {damage} HP
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Effect</p>
                <p className="font-semibold" data-testid="text-spell-effect">{effect}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className={`font-semibold ${target === "self" ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`} data-testid="text-spell-target">
                  {target === "self" ? "Self" : "Opponent"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Damage</p>
                <p className="font-semibold text-destructive" data-testid="text-spell-damage">
                  {damage}
                  {damageBonus > 0 && (
                    <span className="text-xs ml-1 text-green-600 dark:text-green-400">
                      (+{damageBonus} {specializationName})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mana Cost</p>
                <p className={`font-semibold ${manaCost > playerMana ? "text-destructive" : "text-primary"}`} data-testid="text-spell-cost">
                  {manaCost}
                  {costReduction > 0 && (
                    <span className="text-xs ml-1 text-green-600 dark:text-green-400">
                      (-{costReduction} {specializationName})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={onCastSpell}
              disabled={!canCast}
              className="font-semibold"
              data-testid="button-cast-spell"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Cast Spell
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function ComponentInBuilder({
  component,
  removeComponent,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragOver,
}: {
  component: SpellComponent;
  removeComponent: (componentId: string, parentId?: string) => void;
  onDrop: (e: React.DragEvent, parentId?: string) => void;
  onDragOver: (e: React.DragEvent, index?: number, parentId?: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  isDragOver: boolean;
}) {
  const elementColor = ELEMENT_COLORS[component.element];
  const elementBg = ELEMENT_BG_COLORS[component.element];
  const elementBorder = ELEMENT_BORDER_COLORS[component.element];
  
  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${elementBg} ${elementBorder} relative group`}>
        <ElementIcon element={component.element} className={`w-5 h-5 ${elementColor}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${elementColor}`}>{component.name}</span>
            <span className="text-xs px-2 py-0.5 bg-card rounded-md border">{component.type}</span>
          </div>
          <p className="text-xs text-muted-foreground">{component.description}</p>
        </div>
        <span className="text-xs font-bold text-primary">{component.manaCost}m</span>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeComponent(component.id)}
          data-testid={`button-remove-${component.id}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {component.type === "container" && (
        <div
          className={`ml-6 border-l-2 pl-4 ${elementBorder} min-h-16 ${
            isDragOver ? "border-primary bg-primary/5" : ""
          } ${component.children && component.children.length > 0 ? "" : "border-dashed"}`}
          onDrop={(e) => onDrop(e, component.id)}
          onDragOver={(e) => onDragOver(e, undefined, component.id)}
          onDragLeave={onDragLeave}
        >
          {component.children && component.children.length > 0 ? (
            <div className="flex flex-col gap-2">
              {component.children.map((child) => (
                <div key={child.id} className={`flex items-center gap-2 p-2 rounded-md border ${elementBg} ${elementBorder} relative group`}>
                  <ElementIcon element={child.element} className={`w-4 h-4 ${ELEMENT_COLORS[child.element]}`} />
                  <span className={`text-xs font-medium ${ELEMENT_COLORS[child.element]}`}>{child.name}</span>
                  <span className="text-xs ml-auto text-muted-foreground">{child.manaCost}m</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={() => removeComponent(child.id, component.id)}
                    data-testid={`button-remove-child-${child.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
              Drop components here
            </div>
          )}
        </div>
      )}
    </div>
  );
}
