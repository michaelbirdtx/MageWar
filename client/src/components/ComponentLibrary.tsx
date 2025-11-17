import { useState } from "react";
import { SpellComponent, ElementType } from "@shared/schema";
import { availableComponents } from "@/lib/gameData";
import ComponentCard from "./ComponentCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flame, Droplet, Mountain, Wind } from "lucide-react";

interface ComponentLibraryProps {
  onComponentSelect: (component: SpellComponent) => void;
}

export default function ComponentLibrary({ onComponentSelect }: ComponentLibraryProps) {
  const [activeElement, setActiveElement] = useState<ElementType | "all">("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const filteredComponents = activeElement === "all" 
    ? availableComponents 
    : availableComponents.filter(c => c.element === activeElement);
  
  const handleDragStart = (e: React.DragEvent, component: SpellComponent) => {
    setDraggingId(component.id);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(component));
  };
  
  const handleDragEnd = () => {
    setDraggingId(null);
  };
  
  return (
    <div className="flex flex-col gap-4 h-full">
      <h2 className="font-serif font-semibold text-xl" data-testid="text-library-title">Component Library</h2>
      
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
                  isDragging={draggingId === component.id}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
