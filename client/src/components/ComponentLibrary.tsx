import { useState } from "react";
import { SpellComponent, ElementType } from "@shared/schema";
import { alwaysAvailableComponents } from "@/lib/gameData";
import ComponentCard from "./ComponentCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Droplet, Mountain, Wind } from "lucide-react";

interface ComponentLibraryProps {
  onComponentSelect: (component: SpellComponent) => void;
  usedComponentIds?: Set<string>;
  playerHand?: SpellComponent[];
  selectedComponentId?: string;
  isTouchMode?: boolean;
}

export default function ComponentLibrary({ 
  onComponentSelect, 
  usedComponentIds = new Set(), 
  playerHand = [],
  selectedComponentId,
  isTouchMode = false,
}: ComponentLibraryProps) {
  const [activeElement, setActiveElement] = useState<ElementType | "all">("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Combine always-available (containers, Gust) with player's drawn hand
  const allAvailable = [...alwaysAvailableComponents, ...playerHand];
  
  const filteredComponents = activeElement === "all" 
    ? allAvailable 
    : allAvailable.filter(c => c.element === activeElement);
  
  const handleDragStart = (e: React.DragEvent, component: SpellComponent) => {
    if (usedComponentIds.has(component.baseId || component.id)) {
      e.preventDefault();
      return;
    }
    setDraggingId(component.id);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };
  
  const handleDragEnd = () => {
    setDraggingId(null);
  };
  
  const handleClick = (component: SpellComponent) => {
    if (usedComponentIds.has(component.baseId || component.id)) {
      return;
    }
    onComponentSelect(component);
  };
  
  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="font-serif font-semibold text-xl" data-testid="text-library-title">
        Your Hand ({playerHand.length} materials + {alwaysAvailableComponents.length} always available)
      </h2>
      
      <Tabs defaultValue="all" onValueChange={(v) => setActiveElement(v as ElementType | "all")}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" data-testid="button-filter-all">All</TabsTrigger>
          <TabsTrigger value="air" data-testid="button-filter-air">
            <Wind className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="earth" data-testid="button-filter-earth">
            <Mountain className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="fire" data-testid="button-filter-fire">
            <Flame className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="water" data-testid="button-filter-water">
            <Droplet className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeElement} className="mt-4">
          <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[calc(100vh-240px)]">
            {filteredComponents.map((component) => (
              <div key={component.id} onDragEnd={handleDragEnd}>
                <ComponentCard
                  component={component}
                  onDragStart={handleDragStart}
                  onClick={() => handleClick(component)}
                  isDragging={draggingId === component.id}
                  isUsed={usedComponentIds.has(component.baseId || component.id)}
                  isSelected={selectedComponentId === component.id}
                  isTouchMode={isTouchMode}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
