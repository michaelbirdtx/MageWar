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
  // Air Elements
  {
    id: "air-sphere",
    name: "Air Sphere",
    element: "air",
    type: "container",
    role: "container",
    description: "Hollow sphere of compressed air",
    manaCost: 10,
    baseDamage: 0,
    damageMultiplier: 1,
  },
  {
    id: "gust",
    name: "Gust",
    element: "air",
    type: "action",
    role: "propulsion",
    description: "Propels objects forward",
    manaCost: 8,
    baseDamage: 0,
    damageMultiplier: 1,
  },
  {
    id: "vortex",
    name: "Vortex",
    element: "air",
    type: "container",
    role: "container",
    description: "Swirling air container",
    manaCost: 12,
    baseDamage: 0,
    damageMultiplier: 1,
  },
  {
    id: "wind",
    name: "Wind",
    element: "air",
    type: "material",
    role: "propulsion",
    description: "Flowing air current",
    manaCost: 6,
    baseDamage: 0,
    damageMultiplier: 1,
  },

  // Earth Elements
  {
    id: "clay",
    name: "Clay",
    element: "earth",
    type: "material",
    role: "material",
    description: "Moldable earth material",
    manaCost: 5,
    baseDamage: 0,
    damageMultiplier: 3,
  },
  {
    id: "crystal",
    name: "Crystal",
    element: "earth",
    type: "material",
    role: "material",
    description: "Amplifies magical energy",
    manaCost: 12,
    baseDamage: 0,
    damageMultiplier: 5,
  },
  {
    id: "sand",
    name: "Sand",
    element: "earth",
    type: "material",
    role: "material",
    description: "Fine granular material",
    manaCost: 4,
    baseDamage: 0,
    damageMultiplier: 2,
  },
  {
    id: "stone",
    name: "Stone",
    element: "earth",
    type: "material",
    role: "material",
    description: "Dense rock fragment",
    manaCost: 6,
    baseDamage: 0,
    damageMultiplier: 3,
  },

  // Fire Elements
  {
    id: "ember",
    name: "Ember",
    element: "fire",
    type: "material",
    role: "activation",
    description: "Smoldering heat source",
    manaCost: 6,
    baseDamage: 2,
    damageMultiplier: 1,
  },
  {
    id: "flame",
    name: "Flame",
    element: "fire",
    type: "material",
    role: "activation",
    description: "Pure elemental fire",
    manaCost: 10,
    baseDamage: 3,
    damageMultiplier: 1,
  },
  {
    id: "spark",
    name: "Spark",
    element: "fire",
    type: "action",
    role: "activation",
    description: "Ignites flammable materials",
    manaCost: 5,
    baseDamage: 1,
    damageMultiplier: 1,
  },
  {
    id: "sulfur",
    name: "Sulfur",
    element: "earth",
    type: "material",
    role: "material",
    description: "Highly flammable mineral",
    manaCost: 8,
    baseDamage: 0,
    damageMultiplier: 4,
  },

  // Water Elements
  {
    id: "frost",
    name: "Frost",
    element: "water",
    type: "action",
    role: "activation",
    description: "Freezes on contact",
    manaCost: 9,
    baseDamage: 2,
    damageMultiplier: 1,
  },
  {
    id: "ice",
    name: "Ice",
    element: "water",
    type: "material",
    role: "material",
    description: "Frozen water crystal",
    manaCost: 8,
    baseDamage: 0,
    damageMultiplier: 3,
  },
  {
    id: "mist",
    name: "Mist",
    element: "water",
    type: "material",
    role: "material",
    description: "Water vapor",
    manaCost: 5,
    baseDamage: 0,
    damageMultiplier: 2,
  },
  {
    id: "water",
    name: "Water",
    element: "water",
    type: "material",
    role: "material",
    description: "Pure liquid element",
    manaCost: 7,
    baseDamage: 0,
    damageMultiplier: 2,
  },
];

export function calculateSpellPower(components: SpellComponent[]): {
  damage: number;
  manaCost: number;
  effect: string;
  target: "self" | "opponent";
  hasValidPropulsion: boolean;
  validationError?: string;
  clashingContainers?: string[];
} {
  let baseDamageSum = 0;
  let damageMultiplierProduct = 1;
  let manaCost = 0;
  let hasPropulsionInsideContainer = false;
  let propulsionWithoutContainer = false;
  const clashingContainers: string[] = [];
  const activeElements = new Set<ElementType>();

  // Helper to check if a container has clashing elements (Fire + Water)
  const hasClash = (container: SpellComponent): boolean => {
    if (!container.children || container.children.length === 0) return false;
    
    const hasFire = container.children.some(c => c.element === "fire");
    const hasWater = container.children.some(c => c.element === "water");
    
    return hasFire && hasWater;
  };

  const calcComponent = (
    comp: SpellComponent,
    inContainer: boolean = false,
    parentContainer?: SpellComponent,
    ancestorNeutralized: boolean = false,
  ) => {
    // Always add mana cost
    manaCost += comp.manaCost;
    
    // Check if this component should be neutralized
    // A component is neutralized if:
    // 1. It's a Fire or Water direct child of a clashing container, OR
    // 2. Any of its ancestors were neutralized
    const shouldNeutralize = 
      ancestorNeutralized ||
      (parentContainer && 
       hasClash(parentContainer) && 
       (comp.element === "fire" || comp.element === "water"));
    
    if (shouldNeutralize) {
      // Neutralized: no baseDamage, multiplier becomes 1 (neutral)
      baseDamageSum += 0;
      damageMultiplierProduct *= 1;
      // Don't count neutralized elements as active
    } else {
      // Normal calculation
      baseDamageSum += comp.baseDamage;
      damageMultiplierProduct *= comp.damageMultiplier;
      // Track this element as active (not neutralized)
      activeElements.add(comp.element);
    }

    if (comp.role === "propulsion") {
      if (inContainer) {
        hasPropulsionInsideContainer = true;
      } else {
        propulsionWithoutContainer = true;
      }
    }

    if (comp.children) {
      // Check if this container has clashing elements
      const isClashing = comp.role === "container" && hasClash(comp);
      if (isClashing) {
        clashingContainers.push(comp.name);
      }
      
      // Only pass this component as parent if it's a container
      // This ensures only DIRECT children of clashing containers are neutralized
      const containerForChildren = comp.role === "container" ? comp : undefined;
      comp.children.forEach((child) =>
        calcComponent(child, comp.role === "container", containerForChildren, shouldNeutralize),
      );
    }
  };

  components.forEach((comp) => calcComponent(comp, false, undefined, false));

  // Cap multiplier to prevent extreme damage spikes
  const cappedMultiplier = Math.min(damageMultiplierProduct, 10);

  // Calculate final damage with a hard cap at 100
  const uncappedDamage = Math.floor(baseDamageSum * cappedMultiplier);
  const damage = Math.min(uncappedDamage, 100);

  // Determine target: only targets opponent if propulsion is properly nested in container
  const target = hasPropulsionInsideContainer ? "opponent" : "self";

  // Validation
  let validationError: string | undefined;
  if (propulsionWithoutContainer) {
    validationError = "Propulsion components can only be applied to containers";
  }

  // Determine effect name based on ACTIVE (non-neutralized) elements
  const hasFire = activeElements.has("fire");
  const hasWater = activeElements.has("water");
  const hasEarth = activeElements.has("earth");
  const hasAir = activeElements.has("air");

  let effect = "Unknown Spell";

  if (hasPropulsionInsideContainer && hasFire && hasEarth) {
    effect = "Fireball";
  } else if (hasPropulsionInsideContainer && hasWater) {
    effect = "Frost Bolt";
  } else if (hasFire && hasWater) {
    effect = "Steam Blast";
  } else if (hasEarth && hasWater) {
    effect = "Mud Mixture";
  } else if (hasFire) {
    effect = "Fire Spell";
  } else if (hasWater) {
    effect = "Water Spell";
  } else if (hasEarth) {
    effect = "Earth Spell";
  } else if (hasAir) {
    effect = "Air Spell";
  }

  return {
    damage,
    manaCost,
    effect,
    target,
    hasValidPropulsion: hasPropulsionInsideContainer,
    validationError,
    clashingContainers: clashingContainers.length > 0 ? clashingContainers : undefined,
  };
}
