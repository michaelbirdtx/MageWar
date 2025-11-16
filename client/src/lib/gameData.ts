import { SpellComponent, ElementType } from "@shared/schema";

export const ELEMENT_COLORS = {
  fire: "text-red-600 dark:text-red-400",
  water: "text-blue-600 dark:text-blue-400",
  earth: "text-amber-700 dark:text-amber-500",
  air: "text-cyan-600 dark:text-cyan-400",
};

export const ELEMENT_BG_COLORS = {
  fire: "bg-red-50 dark:bg-red-950/30",
  water: "bg-blue-50 dark:bg-blue-950/30",
  earth: "bg-amber-50 dark:bg-amber-950/30",
  air: "bg-cyan-50 dark:bg-cyan-950/30",
};

export const ELEMENT_BORDER_COLORS = {
  fire: "border-red-200 dark:border-red-800",
  water: "border-blue-200 dark:border-blue-800",
  earth: "border-amber-200 dark:border-amber-800",
  air: "border-cyan-200 dark:border-cyan-800",
};

export const availableComponents: SpellComponent[] = [
  // Fire Elements
  {
    id: "spark",
    name: "Spark",
    element: "fire",
    type: "action",
    description: "Ignites flammable materials",
    manaCost: 5,
  },
  {
    id: "flame",
    name: "Flame",
    element: "fire",
    type: "material",
    description: "Pure elemental fire",
    manaCost: 10,
  },
  {
    id: "sulfur",
    name: "Sulfur",
    element: "earth",
    type: "material",
    description: "Highly flammable mineral",
    manaCost: 8,
  },
  {
    id: "ember",
    name: "Ember",
    element: "fire",
    type: "material",
    description: "Smoldering heat source",
    manaCost: 6,
  },
  
  // Water Elements
  {
    id: "ice",
    name: "Ice",
    element: "water",
    type: "material",
    description: "Frozen water crystal",
    manaCost: 8,
  },
  {
    id: "water",
    name: "Water",
    element: "water",
    type: "material",
    description: "Pure liquid element",
    manaCost: 7,
  },
  {
    id: "frost",
    name: "Frost",
    element: "water",
    type: "action",
    description: "Freezes on contact",
    manaCost: 9,
  },
  {
    id: "mist",
    name: "Mist",
    element: "water",
    type: "material",
    description: "Water vapor",
    manaCost: 5,
  },
  
  // Earth Elements
  {
    id: "stone",
    name: "Stone",
    element: "earth",
    type: "material",
    description: "Dense rock fragment",
    manaCost: 6,
  },
  {
    id: "sand",
    name: "Sand",
    element: "earth",
    type: "material",
    description: "Fine granular material",
    manaCost: 4,
  },
  {
    id: "crystal",
    name: "Crystal",
    element: "earth",
    type: "material",
    description: "Amplifies magical energy",
    manaCost: 12,
  },
  {
    id: "clay",
    name: "Clay",
    element: "earth",
    type: "material",
    description: "Moldable earth material",
    manaCost: 5,
  },
  
  // Air Elements
  {
    id: "air-sphere",
    name: "Air Sphere",
    element: "air",
    type: "container",
    description: "Hollow sphere of compressed air",
    manaCost: 10,
  },
  {
    id: "gust",
    name: "Gust",
    element: "air",
    type: "action",
    description: "Propels objects forward",
    manaCost: 8,
  },
  {
    id: "wind",
    name: "Wind",
    element: "air",
    type: "material",
    description: "Flowing air current",
    manaCost: 6,
  },
  {
    id: "vortex",
    name: "Vortex",
    element: "air",
    type: "container",
    description: "Swirling air container",
    manaCost: 12,
  },
];

export function calculateSpellPower(components: SpellComponent[]): { damage: number; manaCost: number; effect: string } {
  let damage = 0;
  let manaCost = 0;
  let effect = "Unknown";
  
  const calcComponent = (comp: SpellComponent) => {
    manaCost += comp.manaCost;
    damage += comp.manaCost * 2;
    
    if (comp.children) {
      comp.children.forEach(calcComponent);
    }
  };
  
  components.forEach(calcComponent);
  
  const hasContainer = components.some(c => c.type === "container" || c.children?.some(ch => ch.type === "container"));
  const hasFire = components.some(c => c.element === "fire" || c.children?.some(ch => ch.element === "fire"));
  const hasWater = components.some(c => c.element === "water" || c.children?.some(ch => ch.element === "water"));
  const hasEarth = components.some(c => c.element === "earth" || c.children?.some(ch => ch.element === "earth"));
  const hasAir = components.some(c => c.element === "air" || c.children?.some(ch => ch.element === "air"));
  
  if (hasContainer && hasFire && hasEarth && hasAir) {
    effect = "Fireball";
    damage = Math.floor(damage * 1.5);
  } else if (hasContainer && hasWater && hasAir) {
    effect = "Frost Bolt";
    damage = Math.floor(damage * 1.3);
  } else if (hasFire && hasWater) {
    effect = "Steam Blast";
    damage = Math.floor(damage * 1.2);
  } else if (hasEarth && hasWater) {
    effect = "Mud Missile";
    damage = Math.floor(damage * 1.1);
  } else if (hasFire) {
    effect = "Fire Spell";
  } else if (hasWater) {
    effect = "Water Spell";
  } else if (hasEarth) {
    effect = "Earth Spell";
  } else if (hasAir) {
    effect = "Air Spell";
  }
  
  return { damage, manaCost, effect };
}
