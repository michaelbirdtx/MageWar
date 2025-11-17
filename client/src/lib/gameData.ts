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
    id: "lightning",
    name: "Lightning",
    element: "air",
    type: "material",
    role: "material",
    description: "Electrical discharge",
    manaCost: 9,
    baseDamage: 4,
    damageMultiplier: 1,
  },
  {
    id: "storm",
    name: "Storm",
    element: "air",
    type: "material",
    role: "material",
    description: "Violent tempest",
    manaCost: 11,
    baseDamage: 5,
    damageMultiplier: 1,
  },

  // Earth Elements
  {
    id: "boulder",
    name: "Boulder",
    element: "earth",
    type: "material",
    role: "material",
    description: "Massive rock",
    manaCost: 10,
    baseDamage: 5,
    damageMultiplier: 1,
  },
  {
    id: "crystal",
    name: "Crystal",
    element: "earth",
    type: "material",
    role: "material",
    description: "Amplifies magical energy",
    manaCost: 7,
    baseDamage: 0,
    damageMultiplier: 2,
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
    id: "magma",
    name: "Magma",
    element: "fire",
    type: "material",
    role: "material",
    description: "Molten rock essence",
    manaCost: 12,
    baseDamage: 6,
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
    description: "Frozen crystalline structure",
    manaCost: 8,
    baseDamage: 0,
    damageMultiplier: 1.5,
  },
  {
    id: "mist",
    name: "Mist",
    element: "water",
    type: "material",
    role: "material",
    description: "Gentle water vapor",
    manaCost: 5,
    baseDamage: 0,
    damageMultiplier: 1,
  },
];

export interface SpellBreakdown {
  containerName: string;
  damage: number;
  shieldPower: number;
  healingPower: number;
  manaCost: number;
  target: "self" | "opponent";
  effectType: string;
}

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
  perSpellBreakdown: SpellBreakdown[];
} {
  let totalDamage = 0;
  let totalShield = 0;
  let totalHealing = 0;
  let totalManaCost = 0;
  let totalBonus = 0;
  let hasPropulsionInsideContainer = false;
  let propulsionWithoutContainer = false;
  let allElements = new Set<ElementType>();
  let allMaterials = new Set<string>();
  const effectTypes = new Set<string>();
  const perSpellBreakdown: SpellBreakdown[] = [];
  const damageSpellNames: string[] = [];
  const shieldSpellNames: string[] = [];
  const healingSpellNames: string[] = [];

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
    containerResult.materials.forEach(m => allMaterials.add(m));
    if (containerResult.effectType) effectTypes.add(containerResult.effectType);
    
    // Generate spell name per-container based on its own materials
    const containerElements = Array.from(containerResult.elements);
    const containerMaterials = containerResult.materials;
    const containerEffectType = new Set<string>([containerResult.effectType]);
    const { effectName, bonus } = determineEffectName(
      containerElements, 
      containerEffectType, 
      containerResult.hasPropulsion, 
      containerMaterials
    );
    
    totalBonus += bonus;
    
    // Categorize names by effect type
    if (containerResult.effectType === "damage" && containerResult.hasPropulsion) {
      damageSpellNames.push(effectName);
    } else if (containerResult.effectType === "shield") {
      shieldSpellNames.push(effectName);
    } else if (containerResult.effectType === "healing") {
      healingSpellNames.push(effectName);
    }
    
    // Add to per-spell breakdown
    if (comp.type === "container") {
      const spellTarget: "self" | "opponent" = containerResult.hasPropulsion ? "opponent" : "self";
      perSpellBreakdown.push({
        containerName: comp.name,
        damage: containerResult.damage,
        shieldPower: containerResult.shield,
        healingPower: containerResult.healing,
        manaCost: containerResult.manaCost,
        target: spellTarget,
        effectType: containerResult.effectType,
      });
    }
  });

  function processContainer(comp: SpellComponent): {
    damage: number;
    shield: number;
    healing: number;
    manaCost: number;
    hasPropulsion: boolean;
    propulsionOutside: boolean;
    elements: Set<ElementType>;
    materials: Set<string>;
    effectType: string;
  } {
    let baseDamage = comp.baseDamage;
    let damageMultiplier = comp.damageMultiplier;
    let manaCost = comp.manaCost;
    let hasPropulsion = false;
    let propulsionOutside = comp.role === "propulsion";
    const elements = new Set<ElementType>([comp.element]);
    const materials = new Set<string>();
    const childMaterials: string[] = [];

    // Recursive function to check for propulsion in descendants
    function hasDescendantPropulsion(component: SpellComponent): boolean {
      if (component.role === "propulsion") return true;
      if (component.children) {
        return component.children.some(child => hasDescendantPropulsion(child));
      }
      return false;
    }
    
    // Process children
    const childElements = new Set<ElementType>();
    if (comp.children) {
      comp.children.forEach((child) => {
        baseDamage += child.baseDamage;
        damageMultiplier *= child.damageMultiplier;
        manaCost += child.manaCost;
        elements.add(child.element);
        childElements.add(child.element);
        const materialId = child.baseId || child.id;
        childMaterials.push(materialId); // Use baseId for pattern matching
        materials.add(materialId);
        
        // Check for propulsion in this child or any of its descendants
        if (comp.role === "container" && hasDescendantPropulsion(child)) {
          hasPropulsion = true;
        }
      });
    }

    // Detect patterns (healing takes priority over shield)
    const componentId = comp.baseId || comp.id;
    const isVortex = componentId === "vortex";
    const hasMist = childMaterials.includes("mist");
    const hasCrystal = childMaterials.includes("crystal");
    const hasEmberForHealing = childMaterials.includes("ember");
    const hasIce = childMaterials.includes("ice");
    const hasEmber = childMaterials.includes("ember");
    const hasSand = childMaterials.includes("sand");
    
    const childrenHaveAllFourElements = childElements.has("fire") && childElements.has("water") && childElements.has("earth") && childElements.has("air");
    const isHealingSpell = isVortex && hasMist && hasCrystal && hasEmberForHealing && childrenHaveAllFourElements;
    const isShieldSpell = isVortex && (hasIce || hasEmber || hasSand) && !isHealingSpell;

    // Determine effect type and calculate power
    let effectType = "damage";
    let shield = 0;
    let healing = 0;
    let containerDamage = 0;

    if (isHealingSpell) {
      effectType = "healing";
      // Healing power = sum of children mana costs
      healing = childMaterials.reduce((sum, baseId) => {
        const child = comp.children?.find(c => (c.baseId || c.id) === baseId);
        return sum + (child?.manaCost || 0);
      }, 0);
    } else if (isShieldSpell) {
      effectType = "shield";
      // Shield power = sum of children mana costs
      shield = childMaterials.reduce((sum, baseId) => {
        const child = comp.children?.find(c => (c.baseId || c.id) === baseId);
        return sum + (child?.manaCost || 0);
      }, 0);
    } else {
      // Normal damage spell
      effectType = "damage";
      const cappedMultiplier = Math.min(damageMultiplier, 10);
      containerDamage = Math.min(Math.floor(baseDamage * cappedMultiplier), 100);
    }

    return {
      damage: containerDamage,
      shield,
      healing,
      manaCost,
      hasPropulsion,
      propulsionOutside,
      elements,
      materials,
      effectType,
    };
  }

  // Universal targeting rule: Gust inside container = opponent targeting
  // This applies to ALL spell types (damage, shield, healing)
  // Allows emergent gameplay: healing/shielding opponent is allowed but unusual
  const target: "self" | "opponent" = hasPropulsionInsideContainer ? "opponent" : "self";

  // Validation
  let validationError: string | undefined;
  if (propulsionWithoutContainer) {
    validationError = "Propulsion components can only be applied to containers";
  }
  
  // Check for empty containers
  const emptyContainers = components.filter(c => 
    c.type === "container" && (!c.children || c.children.length === 0)
  );
  if (emptyContainers.length > 0) {
    validationError = "Containers must have at least one component inside to form a spell";
  }

  // Combine spell names from all containers
  let finalEffectName = "Unknown Spell";
  const allSpellNames = [...damageSpellNames, ...shieldSpellNames, ...healingSpellNames];
  
  if (allSpellNames.length > 0) {
    finalEffectName = allSpellNames.join(" + ");
  }

  // Add multi-spell bonuses
  if (damageSpellNames.length > 0 && shieldSpellNames.length > 0) totalBonus += 2;
  if (damageSpellNames.length > 0 && healingSpellNames.length > 0) totalBonus += 2;
  if (shieldSpellNames.length > 0 && healingSpellNames.length > 0) totalBonus += 2;
  if (damageSpellNames.length > 0 && shieldSpellNames.length > 0 && healingSpellNames.length > 0) totalBonus += 3;

  return {
    damage: totalDamage,
    shieldPower: totalShield,
    healingPower: totalHealing,
    manaCost: totalManaCost,
    effect: finalEffectName,
    target,
    hasValidPropulsion: hasPropulsionInsideContainer,
    validationError,
    bonus: totalBonus,
    perSpellBreakdown,
  };
}

function determineEffectName(
  elements: ElementType[],
  effectTypes: Set<string>,
  hasPropulsion: boolean,
  materials: Set<string>
): { effectName: string; bonus: number } {
  const hasFire = elements.includes("fire");
  const hasWater = elements.includes("water");
  const hasEarth = elements.includes("earth");
  const hasAir = elements.includes("air");
  const hasShield = effectTypes.has("shield");
  const hasHealing = effectTypes.has("healing");
  const hasDamage = effectTypes.has("damage");

  // Helper function to check if materials include all specified components
  const has = (...mats: string[]) => mats.every(m => materials.has(m));

  let effectName = "Unknown Spell";
  let bonus = 0;

  // DAMAGE SPELLS: Check specific material combinations first (most specific → least specific)
  if (hasDamage && hasPropulsion) {
    // 4+ Material Combinations (highest specificity)
    if (has("magma", "sulfur", "crystal", "stone")) {
      effectName = "Crystal Inferno";
      bonus = 6;
    } else if (has("boulder", "frost", "crystal", "stone")) {
      effectName = "Diamond Avalanche";
      bonus = 6;
    } else if (has("lightning", "storm", "crystal", "ice")) {
      effectName = "Prismatic Lightning";
      bonus = 6;
    }
    // 3 Material Combinations
    else if (has("magma", "sulfur", "crystal")) {
      effectName = "Volcanic Crystal";
      bonus = 5;
    } else if (has("magma", "sulfur", "stone")) {
      effectName = "Magma Bomb";
      bonus = 4;
    } else if (has("flame", "ember", "stone")) {
      effectName = "Scorching Boulder";
      bonus = 4;
    } else if (has("boulder", "frost", "crystal")) {
      effectName = "Crystal Glacier";
      bonus = 5;
    } else if (has("boulder", "frost", "stone")) {
      effectName = "Glacial Hammer";
      bonus = 4;
    } else if (has("boulder", "frost", "ice")) {
      effectName = "Frozen Avalanche";
      bonus = 4;
    } else if (has("frost", "ice", "crystal")) {
      effectName = "Diamond Shard";
      bonus = 5;
    } else if (has("lightning", "storm", "crystal")) {
      effectName = "Prismatic Storm";
      bonus = 5;
    } else if (has("magma", "frost")) {
      effectName = "Steam Eruption";
      bonus = 4;
    } else if (has("boulder", "ember")) {
      effectName = "Molten Rock";
      bonus = 4;
    } else if (has("lightning", "frost")) {
      effectName = "Frozen Lightning";
      bonus = 4;
    }
    // 2 Material Combinations
    else if (has("magma", "sulfur")) {
      effectName = "Sulfuric Blast";
      bonus = 3;
    } else if (has("magma", "flame")) {
      effectName = "Volcanic Eruption";
      bonus = 3;
    } else if (has("flame", "ember")) {
      effectName = "Inferno Blast";
      bonus = 3;
    } else if (has("frost", "ice")) {
      effectName = "Glacial Lance";
      bonus = 3;
    } else if (has("boulder", "frost")) {
      effectName = "Frozen Boulder";
      bonus = 3;
    } else if (has("boulder", "stone")) {
      effectName = "Boulder Crash";
      bonus = 3;
    } else if (has("boulder", "crystal")) {
      effectName = "Crystal Boulder";
      bonus = 3;
    } else if (has("stone", "crystal")) {
      effectName = "Crystalline Strike";
      bonus = 3;
    } else if (has("lightning", "storm")) {
      effectName = "Thunderstorm";
      bonus = 3;
    } else if (has("storm", "frost")) {
      effectName = "Frozen Storm";
      bonus = 3;
    }
    // Single high-value materials (medium specificity)
    else if (has("magma")) {
      effectName = "Magma Blast";
      bonus = 2;
    } else if (has("lightning")) {
      effectName = "Lightning Strike";
      bonus = 2;
    } else if (has("boulder")) {
      effectName = "Boulder Throw";
      bonus = 2;
    } else if (has("storm")) {
      effectName = "Storm Surge";
      bonus = 2;
    }
    // Fallback to element-based naming (lowest specificity)
    else if (hasFire && hasWater && hasAir) {
      effectName = "Tempest Storm";
      bonus = 5;
    } else if (hasFire && hasEarth && hasWater) {
      effectName = "Lava Burst";
      bonus = 5;
    } else if (hasWater && hasAir) {
      effectName = "Blizzard";
      bonus = 3;
    } else if (hasFire && hasWater) {
      effectName = "Steam Blast";
      bonus = 3;
    } else if (hasEarth && hasWater) {
      effectName = "Mud Torrent";
      bonus = 2;
    } else if (hasFire && hasEarth) {
      effectName = "Fireball";
    } else if (hasWater) {
      effectName = "Frost Bolt";
    } else if (hasFire) {
      effectName = "Fire Blast";
    } else if (hasEarth) {
      effectName = "Stone Strike";
    } else if (hasAir) {
      effectName = "Wind Blast";
    }
  }

  // Shield spell names (material-specific)
  if (hasShield) {
    if (has("ice", "crystal")) {
      effectName = effectName === "Unknown Spell" ? "Crystal Barrier" : `${effectName} + Crystal Barrier`;
      bonus += 2;
    } else if (has("ice")) {
      effectName = effectName === "Unknown Spell" ? "Ice Barrier" : `${effectName} + Ice Barrier`;
    } else if (has("ember", "stone")) {
      effectName = effectName === "Unknown Spell" ? "Molten Wall" : `${effectName} + Molten Wall`;
      bonus += 2;
    } else if (has("ember")) {
      effectName = effectName === "Unknown Spell" ? "Flame Guard" : `${effectName} + Flame Guard`;
    } else if (has("sand", "crystal")) {
      effectName = effectName === "Unknown Spell" ? "Crystal Shield" : `${effectName} + Crystal Shield`;
      bonus += 2;
    } else if (has("sand")) {
      effectName = effectName === "Unknown Spell" ? "Sand Wall" : `${effectName} + Sand Wall`;
    } else if (hasWater && hasFire) {
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

  // Healing spell names (material-specific)
  if (hasHealing) {
    if (has("mist", "crystal")) {
      effectName = effectName === "Unknown Spell" ? "Crystal Renewal" : `${effectName} + Crystal Renewal`;
      bonus += 2;
    } else if (hasWater) {
      effectName = effectName === "Unknown Spell" ? "Healing Waters" : `${effectName} + Healing Waters`;
    } else if (hasEarth) {
      effectName = effectName === "Unknown Spell" ? "Life Essence" : `${effectName} + Life Essence`;
    } else if (hasAir) {
      effectName = effectName === "Unknown Spell" ? "Vital Breeze" : `${effectName} + Vital Breeze`;
    }
  }

  // Multi-spell bonuses
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
