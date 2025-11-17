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
    id: "vital-breeze",
    name: "Vital Breeze",
    element: "air",
    type: "material",
    role: "material",
    description: "Rejuvenating wind essence",
    manaCost: 6,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "healing",
    healingPower: 10,
  },
  {
    id: "wind",
    name: "Wind",
    element: "air",
    type: "material",
    role: "material",
    description: "Flowing air current",
    manaCost: 6,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "shield",
    shieldPower: 8,
  },

  // Earth Elements
  {
    id: "clay",
    name: "Clay",
    element: "earth",
    type: "material",
    role: "material",
    description: "Restorative earth essence",
    manaCost: 5,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "healing",
    healingPower: 10,
  },
  {
    id: "crystal",
    name: "Crystal",
    element: "earth",
    type: "material",
    role: "material",
    description: "Crystalline barrier shield",
    manaCost: 12,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "shield",
    shieldPower: 15,
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
    id: "flame-guard",
    name: "Flame Guard",
    element: "fire",
    type: "material",
    role: "material",
    description: "Protective fire barrier",
    manaCost: 9,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "shield",
    shieldPower: 10,
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
    description: "Frozen barrier shield",
    manaCost: 8,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "shield",
    shieldPower: 12,
  },
  {
    id: "mist",
    name: "Mist",
    element: "water",
    type: "material",
    role: "material",
    description: "Healing mist vapor",
    manaCost: 5,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "healing",
    healingPower: 8,
  },
  {
    id: "water",
    name: "Water",
    element: "water",
    type: "material",
    role: "material",
    description: "Pure healing essence",
    manaCost: 7,
    baseDamage: 0,
    damageMultiplier: 1,
    effectType: "healing",
    healingPower: 12,
  },
];

export function calculateSpellPower(components: SpellComponent[]): {
  damage: number;
  shieldPower: number;
  healingPower: number;
  manaCost: number;
  effect: string;
  target: "self" | "opponent";
  hasValidPropulsion: boolean;
  validationError?: string;
  bonus: number;
} {
  let totalDamage = 0;
  let totalShield = 0;
  let totalHealing = 0;
  let totalManaCost = 0;
  let hasPropulsionInsideContainer = false;
  let propulsionWithoutContainer = false;
  let allElements = new Set<ElementType>();
  const effectTypes = new Set<string>();

  // Process each top-level component (container or standalone)
  components.forEach((comp) => {
    const containerResult = processContainer(comp);
    totalDamage += containerResult.damage;
    totalShield += containerResult.shield;
    totalHealing += containerResult.healing;
    totalManaCost += containerResult.manaCost;
    
    if (containerResult.hasPropulsion) hasPropulsionInsideContainer = true;
    if (containerResult.propulsionOutside) propulsionWithoutContainer = true;
    
    containerResult.elements.forEach(e => allElements.add(e));
    if (containerResult.effectType) effectTypes.add(containerResult.effectType);
  });

  function processContainer(comp: SpellComponent): {
    damage: number;
    shield: number;
    healing: number;
    manaCost: number;
    hasPropulsion: boolean;
    propulsionOutside: boolean;
    elements: Set<ElementType>;
    effectType: string;
  } {
    let baseDamage = comp.baseDamage;
    let damageMultiplier = comp.damageMultiplier;
    let shield = comp.shieldPower || 0;
    let healing = comp.healingPower || 0;
    let manaCost = comp.manaCost;
    let hasPropulsion = false;
    let propulsionOutside = comp.role === "propulsion";
    const elements = new Set<ElementType>([comp.element]);
    let effectType = comp.effectType || "damage";

    // Process children
    if (comp.children) {
      comp.children.forEach((child) => {
        baseDamage += child.baseDamage;
        damageMultiplier *= child.damageMultiplier;
        shield += child.shieldPower || 0;
        healing += child.healingPower || 0;
        manaCost += child.manaCost;
        elements.add(child.element);
        
        if (child.role === "propulsion" && comp.role === "container") {
          hasPropulsion = true;
        }
        
        // Determine effect type from materials
        if (child.effectType === "shield") effectType = "shield";
        if (child.effectType === "healing") effectType = "healing";
      });
    }

    // Calculate final damage for this container
    const cappedMultiplier = Math.min(damageMultiplier, 10);
    const containerDamage = Math.min(Math.floor(baseDamage * cappedMultiplier), 100);

    return {
      damage: effectType === "damage" ? containerDamage : 0,
      shield: effectType === "shield" ? shield : 0,
      healing: effectType === "healing" ? healing : 0,
      manaCost,
      hasPropulsion,
      propulsionOutside,
      elements,
      effectType,
    };
  }

  // Determine target based on primary effect type
  let target: "self" | "opponent" = "self";
  if (totalDamage > 0 && totalShield === 0 && totalHealing === 0) {
    // Pure damage spell targets opponent
    target = "opponent";
  } else if (totalDamage > 0 && (totalShield > 0 || totalHealing > 0)) {
    // Mixed spell with damage targets opponent
    target = "opponent";
  } else {
    // Pure shield or healing spell targets self
    target = "self";
  }

  // Validation
  let validationError: string | undefined;
  if (propulsionWithoutContainer) {
    validationError = "Propulsion components can only be applied to containers";
  }

  // Determine creative effect names and bonuses
  const elementsArray = Array.from(allElements);
  const { effectName, bonus } = determineEffectName(elementsArray, effectTypes, hasPropulsionInsideContainer);

  return {
    damage: totalDamage,
    shieldPower: totalShield,
    healingPower: totalHealing,
    manaCost: totalManaCost,
    effect: effectName,
    target,
    hasValidPropulsion: hasPropulsionInsideContainer,
    validationError,
    bonus,
  };
}

function determineEffectName(
  elements: ElementType[],
  effectTypes: Set<string>,
  hasPropulsion: boolean
): { effectName: string; bonus: number } {
  const hasFire = elements.includes("fire");
  const hasWater = elements.includes("water");
  const hasEarth = elements.includes("earth");
  const hasAir = elements.includes("air");
  const hasShield = effectTypes.has("shield");
  const hasHealing = effectTypes.has("healing");
  const hasDamage = effectTypes.has("damage");

  let effectName = "Unknown Spell";
  let bonus = 0;

  // Creative multi-element combinations (bonus damage!)
  if (hasFire && hasWater && hasAir && hasPropulsion) {
    effectName = "Tempest Storm";
    bonus = 5;
  } else if (hasFire && hasEarth && hasWater && hasPropulsion) {
    effectName = "Lava Burst";
    bonus = 5;
  } else if (hasWater && hasAir && hasPropulsion) {
    effectName = "Blizzard";
    bonus = 3;
  } else if (hasFire && hasWater && hasPropulsion) {
    effectName = "Steam Blast";
    bonus = 3;
  } else if (hasEarth && hasWater && hasPropulsion) {
    effectName = "Mud Torrent";
    bonus = 2;
  } else if (hasFire && hasEarth && hasPropulsion) {
    effectName = "Fireball";
  } else if (hasWater && hasPropulsion) {
    effectName = "Frost Bolt";
  } else if (hasFire && hasPropulsion) {
    effectName = "Fire Blast";
  } else if (hasEarth && hasPropulsion) {
    effectName = "Stone Strike";
  } else if (hasAir && hasPropulsion) {
    effectName = "Wind Blast";
  }
  
  // Shield spell names
  if (hasShield) {
    if (hasWater && hasFire) {
      effectName = effectName === "Unknown Spell" ? "Steam Shield" : `${effectName} + Steam Shield`;
    } else if (hasWater) {
      effectName = effectName === "Unknown Spell" ? "Ice Barrier" : `${effectName} + Ice Barrier`;
    } else if (hasEarth) {
      effectName = effectName === "Unknown Spell" ? "Stone Wall" : `${effectName} + Stone Wall`;
    } else if (hasFire) {
      effectName = effectName === "Unknown Spell" ? "Flame Guard" : `${effectName} + Flame Guard`;
    } else if (hasAir) {
      effectName = effectName === "Unknown Spell" ? "Wind Ward" : `${effectName} + Wind Ward`;
    }
  }

  // Healing spell names
  if (hasHealing) {
    if (hasWater) {
      effectName = effectName === "Unknown Spell" ? "Healing Waters" : `${effectName} + Healing Waters`;
    } else if (hasEarth) {
      effectName = effectName === "Unknown Spell" ? "Life Essence" : `${effectName} + Life Essence`;
    } else if (hasAir) {
      effectName = effectName === "Unknown Spell" ? "Vital Breeze" : `${effectName} + Vital Breeze`;
    }
  }

  // Multi-spell combinations get extra bonus
  if (hasDamage && hasShield) bonus += 2;
  if (hasDamage && hasHealing) bonus += 2;
  if (hasShield && hasHealing) bonus += 2;
  if (hasDamage && hasShield && hasHealing) bonus += 3;

  return { effectName, bonus };
}

export function applySpecializationBonus(
  components: SpellComponent[],
  baseDamage: number,
  baseManaCost: number,
  specialization: "pyromancer" | "aquamancer"
): { damage: number; manaCost: number; damageBonus: number; costReduction: number } {
  // Determine which element gets the bonus
  const bonusElement: ElementType = specialization === "pyromancer" ? "fire" : "water";
  
  // Check if spell contains the bonus element
  const hasMatchingElement = (comp: SpellComponent): boolean => {
    if (comp.element === bonusElement) return true;
    if (comp.children) {
      return comp.children.some(hasMatchingElement);
    }
    return false;
  };
  
  const hasBonusElement = components.some(hasMatchingElement);
  
  if (!hasBonusElement) {
    return { damage: baseDamage, manaCost: baseManaCost, damageBonus: 0, costReduction: 0 };
  }
  
  // Calculate mana cost reduction per-component (matches backend logic)
  let totalReducedCost = 0;
  const calculateReducedCost = (comp: SpellComponent): void => {
    let componentCost = comp.manaCost;
    if (comp.element === bonusElement) {
      componentCost = Math.floor(componentCost * 0.8);
    }
    totalReducedCost += componentCost;
    
    if (comp.children) {
      comp.children.forEach(calculateReducedCost);
    }
  };
  
  components.forEach(calculateReducedCost);
  const costReduction = baseManaCost - totalReducedCost;
  
  // Apply +20% damage bonus to total (matches backend logic)
  const bonusDamage = Math.floor(baseDamage * 1.2);
  const damageBonus = bonusDamage - baseDamage;
  
  return {
    damage: bonusDamage,
    manaCost: totalReducedCost,
    damageBonus,
    costReduction,
  };
}
