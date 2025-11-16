import { useState } from "react";
import SpellBuilder from "../SpellBuilder";
import { SpellComponent } from "@shared/schema";

export default function SpellBuilderExample() {
  const [components, setComponents] = useState<SpellComponent[]>([]);
  
  return (
    <div className="p-4 max-w-2xl">
      <SpellBuilder
        components={components}
        onComponentsChange={setComponents}
        onCastSpell={() => console.log("Cast spell!")}
        onClearSpell={() => setComponents([])}
        playerMana={100}
      />
    </div>
  );
}
