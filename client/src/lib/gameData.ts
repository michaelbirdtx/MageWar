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

// Components that are always available (not drawn)
export const alwaysAvailableComponents: SpellComponent[] = [
  // Containers - always available
  {
    id: "air-sphere",
    name: "Air Sphere",
    element: "air",
    type: "container",
    role: "container",
    description: "Hollow sphere of compressed air",
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
    baseDamage: 0,
    damageMultiplier: 1,
  },
  // Propulsion - always available
  {
    id: "gust",
    name: "Gust",
    element: "air",
    type: "action",
    role: "propulsion",
    description: "Propels objects forward",
    baseDamage: 0,
    damageMultiplier: 1,
  },
];

// Components that must be drawn from the pool
export const drawableComponents: SpellComponent[] = [
  // Air Elements
  {
    id: "lightning",
    name: "Lightning",
    element: "air",
    type: "material",
    role: "material",
    description: "Electrical discharge",
    baseDamage: 4,
    damageMultiplier: 1,
    rarity: "uncommon",
  },
  {
    id: "storm",
    name: "Storm",
    element: "air",
    type: "material",
    role: "material",
    description: "Violent tempest",
    baseDamage: 5,
    damageMultiplier: 1,
    rarity: "uncommon",
  },
  {
    id: "breeze",
    name: "Breeze",
    element: "air",
    type: "material",
    role: "material",
    description: "Gentle wind current",
    baseDamage: 1,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "cyclone",
    name: "Cyclone",
    element: "air",
    type: "material",
    role: "material",
    description: "Concentrated spinning wind",
    baseDamage: 3,
    damageMultiplier: 1.5,
    rarity: "rare",
  },

  // Earth Elements
  {
    id: "boulder",
    name: "Boulder",
    element: "earth",
    type: "material",
    role: "material",
    description: "Massive rock",
    baseDamage: 5,
    damageMultiplier: 1,
    rarity: "uncommon",
  },
  {
    id: "crystal",
    name: "Crystal",
    element: "earth",
    type: "material",
    role: "material",
    description: "Amplifies magical energy",
    baseDamage: 0,
    damageMultiplier: 2,
    rarity: "rare",
  },
  {
    id: "sand",
    name: "Sand",
    element: "earth",
    type: "material",
    role: "material",
    description: "Fine granular material. Creates a shield in Vortex.",
    baseDamage: 1,
    damageMultiplier: 1.5,
    rarity: "common",
  },
  {
    id: "stone",
    name: "Stone",
    element: "earth",
    type: "material",
    role: "material",
    description: "Dense rock fragment",
    baseDamage: 2,
    damageMultiplier: 2,
    rarity: "uncommon",
  },
  {
    id: "sulfur",
    name: "Sulfur",
    element: "earth",
    type: "material",
    role: "material",
    description: "Highly flammable mineral",
    baseDamage: 0,
    damageMultiplier: 3,
    rarity: "rare",
  },
  {
    id: "pebble",
    name: "Pebble",
    element: "earth",
    type: "material",
    role: "material",
    description: "Small smooth stone",
    baseDamage: 1,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "quartz",
    name: "Quartz",
    element: "earth",
    type: "material",
    role: "material",
    description: "Semi-precious mineral",
    baseDamage: 2,
    damageMultiplier: 1.5,
    rarity: "uncommon",
  },

  // Fire Elements
  {
    id: "ember",
    name: "Ember",
    element: "fire",
    type: "material",
    role: "activation",
    description: "Smoldering heat source. Creates a shield in Vortex.",
    baseDamage: 2,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "flame",
    name: "Flame",
    element: "fire",
    type: "material",
    role: "activation",
    description: "Pure elemental fire",
    baseDamage: 3,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "magma",
    name: "Magma",
    element: "fire",
    type: "material",
    role: "material",
    description: "Molten rock essence",
    baseDamage: 6,
    damageMultiplier: 1,
    rarity: "rare",
  },
  {
    id: "spark",
    name: "Spark",
    element: "fire",
    type: "action",
    role: "activation",
    description: "Ignites flammable materials",
    baseDamage: 1,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "inferno",
    name: "Inferno",
    element: "fire",
    type: "material",
    role: "material",
    description: "Raging blaze",
    baseDamage: 5,
    damageMultiplier: 1.5,
    rarity: "rare",
  },
  {
    id: "cinder",
    name: "Cinder",
    element: "fire",
    type: "material",
    role: "material",
    description: "Burnt coal remains",
    baseDamage: 2,
    damageMultiplier: 1.5,
    rarity: "common",
  },

  // Water Elements
  {
    id: "frost",
    name: "Frost",
    element: "water",
    type: "action",
    role: "activation",
    description: "Freezes on contact",
    baseDamage: 2,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "ice",
    name: "Ice",
    element: "water",
    type: "material",
    role: "material",
    description: "Frozen crystalline structure. Creates a shield in Vortex.",
    baseDamage: 3,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "mist",
    name: "Mist",
    element: "water",
    type: "material",
    role: "material",
    description: "Gentle water vapor",
    baseDamage: 0,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "wave",
    name: "Wave",
    element: "water",
    type: "material",
    role: "material",
    description: "Surging water force",
    baseDamage: 4,
    damageMultiplier: 1,
    rarity: "uncommon",
  },
  {
    id: "glacier",
    name: "Glacier",
    element: "water",
    type: "material",
    role: "material",
    description: "Massive ice formation",
    baseDamage: 4,
    damageMultiplier: 1.5,
    rarity: "rare",
  },
  {
    id: "droplet",
    name: "Droplet",
    element: "water",
    type: "material",
    role: "material",
    description: "Pure water essence",
    baseDamage: 1,
    damageMultiplier: 1,
    rarity: "common",
  },
  {
    id: "torrent",
    name: "Torrent",
    element: "water",
    type: "material",
    role: "material",
    description: "Rushing water stream",
    baseDamage: 3,
    damageMultiplier: 1.5,
    rarity: "uncommon",
  },
];

// Combined list for backward compatibility
export const availableComponents: SpellComponent[] = [
  ...alwaysAvailableComponents,
  ...drawableComponents,
];

export interface SpellBreakdown {
  containerName: string;
  damage: number;
  shieldPower: number;
  healingPower: number;
  target: "self" | "opponent";
  effectType: string;
}

// Calculate intellect damage bonus (matches backend calculation)
export function calculateIntellectBonus(intellect: number): number {
  return Math.floor(intellect / 2);
}

export function calculateSpellPower(
  components: SpellComponent[], 
  intellect: number = 0,
  specialization?: "pyromancer" | "aquamancer"
): {
  damage: number;
  shieldPower: number;
  healingPower: number;
  effect: string;
  target: "self" | "opponent";
  hasValidPropulsion: boolean;
  validationError?: string;
  perSpellBreakdown: SpellBreakdown[];
  componentsUsed: number;
} {
  let totalDamage = 0;
  let totalShield = 0;
  let totalHealing = 0;
  let hasPropulsionInsideContainer = false;
  let propulsionWithoutContainer = false;
  const perSpellBreakdown: SpellBreakdown[] = [];
  const effectTypes: string[] = [];
  let componentsUsed = 0;

  // Count material components used
  function countMaterials(comps: SpellComponent[]): number {
    let count = 0;
    for (const comp of comps) {
      if (comp.role !== "container" && comp.role !== "propulsion") count++;
      if (comp.children) count += countMaterials(comp.children);
    }
    return count;
  }
  componentsUsed = countMaterials(components);

  function processContainer(comp: SpellComponent): {
    damage: number;
    shield: number;
    healing: number;
    hasPropulsion: boolean;
    effectType: string;
    elements: Set<ElementType>;
  } {
    let baseDamage = comp.baseDamage;
    let damageMultiplier = comp.damageMultiplier;
    let hasPropulsion = false;
    const childElements = new Set<ElementType>();
    const elements = new Set<ElementType>([comp.element]);
    const childMaterials: string[] = [];

    function hasDescendantPropulsion(component: SpellComponent): boolean {
      if (component.role === "propulsion") return true;
      if (component.children) {
        return component.children.some(child => hasDescendantPropulsion(child));
      }
      return false;
    }
    
    if (comp.children) {
      comp.children.forEach((child) => {
        baseDamage += child.baseDamage;
        damageMultiplier *= child.damageMultiplier;
        childElements.add(child.element);
        elements.add(child.element);
        const materialId = child.baseId || child.id;
        childMaterials.push(materialId);
        
        if (comp.role === "container" && hasDescendantPropulsion(child)) {
          hasPropulsion = true;
        }
      });
    }

    // Detect patterns
    const componentId = comp.baseId || comp.id;
    const isVortex = componentId === "vortex";
    const hasMist = childMaterials.includes("mist");
    const hasCrystal = childMaterials.includes("crystal");
    const hasEmber = childMaterials.includes("ember");
    const hasIce = childMaterials.includes("ice");
    const hasSand = childMaterials.includes("sand");
    
    const hasAllFourElements = childElements.has("fire") && childElements.has("water") && childElements.has("earth") && childElements.has("air");
    const isHealingSpell = isVortex && hasMist && hasCrystal && hasEmber && hasAllFourElements;
    const isShieldSpell = isVortex && (hasIce || hasEmber || hasSand) && !isHealingSpell;

    let effectType = "damage";
    let shield = 0;
    let healing = 0;
    let containerDamage = 0;

    if (isHealingSpell) {
      effectType = "healing";
      healing = Math.max(5, baseDamage * 2);
    } else if (isShieldSpell) {
      effectType = "shield";
      shield = Math.max(5, baseDamage * 2);
    } else {
      effectType = "damage";
      const cappedMultiplier = Math.min(damageMultiplier, 10);
      containerDamage = Math.floor(baseDamage * cappedMultiplier);
      
      // Apply specialization bonus inside container (matches backend)
      if (specialization === "pyromancer" && elements.has("fire")) {
        containerDamage = Math.floor(containerDamage * 1.2);
      } else if (specialization === "aquamancer" && elements.has("water")) {
        containerDamage = Math.floor(containerDamage * 1.2);
      }
      
      containerDamage = Math.min(containerDamage, 100);
    }

    const validDamage = (effectType === "damage" && hasPropulsion) ? containerDamage : 0;

    return { damage: validDamage, shield, healing, hasPropulsion, effectType, elements };
  }
  
  // Process each container
  components.forEach((comp) => {
    if (comp.role === "propulsion") {
      propulsionWithoutContainer = true;
      return;
    }
    
    if (comp.type !== "container") return;
    
    const result = processContainer(comp);
    totalDamage += result.damage;
    totalShield += result.shield;
    totalHealing += result.healing;
    if (result.hasPropulsion) hasPropulsionInsideContainer = true;
    effectTypes.push(result.effectType);
    
    const spellTarget: "self" | "opponent" = result.hasPropulsion ? "opponent" : "self";
    perSpellBreakdown.push({
      containerName: comp.name,
      damage: result.damage,
      shieldPower: result.shield,
      healingPower: result.healing,
      target: spellTarget,
      effectType: result.effectType,
    });
  });

  // Add intellect bonus to damage (applied to first damage spell in breakdown)
  // Calculate bonus the same way backend does: floor(intellect / 2)
  const intellectBonus = calculateIntellectBonus(intellect);
  if (intellectBonus > 0 && perSpellBreakdown.length > 0) {
    const firstDamageSpell = perSpellBreakdown.find(s => s.effectType === "damage" && s.damage > 0);
    if (firstDamageSpell) {
      firstDamageSpell.damage += intellectBonus;
    }
  }
  totalDamage += intellectBonus;

  const target: "self" | "opponent" = hasPropulsionInsideContainer ? "opponent" : "self";

  let validationError: string | undefined;
  if (propulsionWithoutContainer) {
    validationError = "Propulsion components can only be applied to containers";
  }
  
  const emptyContainers = components.filter(c => 
    c.type === "container" && (!c.children || c.children.length === 0)
  );
  if (emptyContainers.length > 0) {
    validationError = "Containers must have at least one component inside to form a spell";
  }

  // Simple effect naming
  const hasAttack = effectTypes.includes("damage") && hasPropulsionInsideContainer;
  const hasShield = effectTypes.includes("shield");
  const hasHeal = effectTypes.includes("healing");
  
  let finalEffectName = "Unknown Spell";
  if (hasAttack && hasShield && hasHeal) {
    finalEffectName = "Attack + Shield + Heal";
  } else if (hasAttack && hasShield) {
    finalEffectName = "Attack + Shield";
  } else if (hasAttack && hasHeal) {
    finalEffectName = "Attack + Heal";
  } else if (hasShield && hasHeal) {
    finalEffectName = "Shield + Heal";
  } else if (hasAttack) {
    finalEffectName = "Attack";
  } else if (hasShield) {
    finalEffectName = "Shield";
  } else if (hasHeal) {
    finalEffectName = "Heal";
  }

  return {
    damage: totalDamage,
    shieldPower: totalShield,
    healingPower: totalHealing,
    effect: finalEffectName,
    target,
    hasValidPropulsion: hasPropulsionInsideContainer,
    validationError,
    perSpellBreakdown,
    componentsUsed,
  };
}

export function applySpecializationBonus(
  components: SpellComponent[],
  baseDamage: number,
  specialization: "pyromancer" | "aquamancer"
): { damage: number; damageBonus: number } {
  const bonusElement: ElementType = specialization === "pyromancer" ? "fire" : "water";
  
  const hasMatchingElement = (comp: SpellComponent): boolean => {
    if (comp.element === bonusElement) return true;
    if (comp.children) {
      return comp.children.some(hasMatchingElement);
    }
    return false;
  };
  
  const hasBonusElement = components.some(hasMatchingElement);
  
  if (!hasBonusElement) {
    return { damage: baseDamage, damageBonus: 0 };
  }
  
  const bonusDamage = Math.floor(baseDamage * 1.2);
  const damageBonus = bonusDamage - baseDamage;
  
  return { damage: bonusDamage, damageBonus };
}
