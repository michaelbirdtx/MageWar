import { GameState, Mage, SpellComponent, Spell, Specialization } from "@shared/schema";
import { randomUUID } from "crypto";

export interface CharacterAttributes {
  name: string;
  intellect: number;
  stamina: number;
  wisdom: number;
  specialization: Specialization;
}

// Drawable components pool (excluding containers and Gust which are always available)
const drawableComponentIds = [
  // Air
  "lightning", "storm", "breeze", "cyclone",
  // Earth
  "boulder", "crystal", "sand", "stone", "sulfur", "pebble", "quartz",
  // Fire
  "ember", "flame", "magma", "spark", "inferno", "cinder",
  // Water
  "frost", "ice", "mist", "wave", "glacier", "droplet", "torrent",
];

function calculateMaxHealth(stamina: number): number {
  // Base health of 50, +10 per stamina point
  return 50 + (stamina * 10);
}

function calculateStartingHandSize(wisdom: number): number {
  // Starting hand size = wisdom / 2, rounded up
  return Math.ceil(wisdom / 2);
}

function calculateIntellectDamageBonus(intellect: number): number {
  // Intellect adds flat damage bonus: +1 damage per 2 intellect points
  return Math.floor(intellect / 2);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createComponentPool(): string[] {
  // Create a shuffled pool with multiple copies based on rarity
  // Common: 3 copies, Uncommon: 2 copies, Rare: 1 copy
  const pool: string[] = [];
  const rarityMultiplier: Record<string, number> = {
    common: 3,
    uncommon: 2,
    rare: 1,
  };
  
  // Component rarity mapping
  const componentRarity: Record<string, string> = {
    // Common
    "breeze": "common", "pebble": "common", "ember": "common", "flame": "common",
    "spark": "common", "cinder": "common", "frost": "common", "ice": "common",
    "mist": "common", "droplet": "common", "sand": "common",
    // Uncommon
    "lightning": "uncommon", "storm": "uncommon", "boulder": "uncommon",
    "stone": "uncommon", "quartz": "uncommon", "wave": "uncommon", "torrent": "uncommon",
    // Rare
    "cyclone": "rare", "crystal": "rare", "sulfur": "rare", "magma": "rare",
    "inferno": "rare", "glacier": "rare",
  };
  
  for (const compId of drawableComponentIds) {
    const rarity = componentRarity[compId] || "common";
    const copies = rarityMultiplier[rarity] || 1;
    for (let i = 0; i < copies; i++) {
      pool.push(compId);
    }
  }
  
  return shuffleArray(pool);
}

function drawComponents(pool: string[], count: number): { drawn: string[], remaining: string[] } {
  const drawn = pool.slice(0, count);
  const remaining = pool.slice(count);
  return { drawn, remaining };
}

function createMageFromAttributes(attributes: CharacterAttributes, isPlayer: boolean, initialHand: string[]): Mage {
  const maxHealth = calculateMaxHealth(attributes.stamina);
  
  return {
    id: randomUUID(),
    name: attributes.name,
    health: maxHealth,
    maxHealth,
    intellect: attributes.intellect,
    stamina: attributes.stamina,
    wisdom: attributes.wisdom,
    specialization: attributes.specialization,
    isPlayer,
    hand: initialHand,
  };
}

function generateAICharacterAttributes(): CharacterAttributes {
  // AI chooses specialization randomly
  const specializations: Specialization[] = ["pyromancer", "aquamancer"];
  const specialization = specializations[Math.floor(Math.random() * specializations.length)];
  
  // AI distributes 6 free points strategically
  // For pyromancers: prioritize intellect (more damage bonus)
  // For aquamancers: prioritize wisdom (larger hand size)
  const baseAttributes = { intellect: 10, stamina: 10, wisdom: 10 };
  
  if (specialization === "pyromancer") {
    baseAttributes.intellect += 3; // More damage bonus for aggressive playstyle
    baseAttributes.stamina += 2;   // Some survivability
    baseAttributes.wisdom += 1;    // Smaller hand but powerful spells
  } else {
    baseAttributes.intellect += 2; // Good damage bonus
    baseAttributes.stamina += 2;   // Balanced survivability
    baseAttributes.wisdom += 2;    // Larger hand for more options
  }
  
  return {
    name: "Dark Sorcerer",
    ...baseAttributes,
    specialization,
  };
}

export function createInitialGameState(playerAttributes: CharacterAttributes): GameState {
  const aiAttributes = generateAICharacterAttributes();
  
  // Create the component pool
  const componentPool = createComponentPool();
  
  // Calculate starting hand sizes
  const playerHandSize = calculateStartingHandSize(playerAttributes.wisdom);
  const aiHandSize = calculateStartingHandSize(aiAttributes.wisdom);
  
  // Draw initial hands
  const playerDraw = drawComponents(componentPool, playerHandSize);
  const aiDraw = drawComponents(playerDraw.remaining, aiHandSize);
  
  return {
    player: createMageFromAttributes(playerAttributes, true, playerDraw.drawn),
    opponent: createMageFromAttributes(aiAttributes, false, aiDraw.drawn),
    currentTurn: "player",
    gamePhase: "building",
    playerSpellLocked: false,
    aiSpellLocked: false,
    lockedPlayerSpell: null,
    lockedAiSpell: null,
    componentPool: aiDraw.remaining,
    round: 1,
  };
}

// Export for use in replenishment after each round
export { drawComponents, calculateIntellectDamageBonus };

export function calculateSpellStats(
  components: SpellComponent[], 
  specialization?: Specialization,
  intellect?: number
): { 
  damage: number; 
  shieldPower: number;
  healingPower: number;
  effect: string;
  target: "self" | "opponent";
  hasValidPropulsion: boolean;
  componentsUsed: number;
} {
  let totalDamage = 0;
  let totalShield = 0;
  let totalHealing = 0;
  let componentsUsed = 0;
  let hasPropulsionInsideContainer = false;
  const allElements = new Set<string>();
  const effectTypes = new Set<string>();

  // Process each top-level container
  components.forEach((comp) => {
    const result = processContainer(comp, specialization);
    totalDamage += result.damage;
    totalShield += result.shield;
    totalHealing += result.healing;
    componentsUsed += result.componentCount;
    
    if (result.hasPropulsion) hasPropulsionInsideContainer = true;
    result.elements.forEach(e => allElements.add(e));
    if (result.effectType) effectTypes.add(result.effectType);
  });

  // Apply intellect damage bonus
  if (intellect && totalDamage > 0) {
    const intellectBonus = calculateIntellectDamageBonus(intellect);
    totalDamage += intellectBonus;
  }

  function processContainer(comp: SpellComponent, spec?: Specialization): {
    damage: number;
    shield: number;
    healing: number;
    componentCount: number;
    hasPropulsion: boolean;
    elements: Set<string>;
    effectType: string;
  } {
    let baseDamage = comp.baseDamage;
    let damageMultiplier = comp.damageMultiplier;
    let shield = comp.shieldPower || 0;
    let healing = comp.healingPower || 0;
    let hasPropulsion = false;
    let componentCount = 0; // Don't count containers/gust
    const elements = new Set<string>([comp.element]);
    let effectType = comp.effectType || "damage";
    const childMaterials: string[] = [];
    const childElements = new Set<string>();

    // Process children
    if (comp.children) {
      comp.children.forEach((child) => {
        baseDamage += child.baseDamage;
        damageMultiplier *= child.damageMultiplier;
        shield += child.shieldPower || 0;
        healing += child.healingPower || 0;
        
        elements.add(child.element);
        childElements.add(child.element);
        const materialId = child.baseId || child.id;
        childMaterials.push(materialId);
        
        if (child.role === "propulsion" && comp.role === "container") {
          hasPropulsion = true;
          // Don't count propulsion (gust) toward component count
        } else if (child.role !== "container") {
          // Count drawable components (materials, activations, etc.)
          componentCount++;
        }
        
        if (child.effectType === "shield") effectType = "shield";
        if (child.effectType === "healing") effectType = "healing";
      });
    }
    
    // Detect patterns (healing takes priority over shield)
    const componentId = comp.baseId || comp.id;
    const isVortex = componentId === "vortex";
    const hasMist = childMaterials.includes("mist");
    const hasCrystal = childMaterials.includes("crystal");
    const hasEmber = childMaterials.includes("ember");
    const hasIce = childMaterials.includes("ice");
    const hasSand = childMaterials.includes("sand");
    const childrenHaveAllFourElements = childElements.has("fire") && childElements.has("water") && childElements.has("earth") && childElements.has("air");
    
    const isHealingSpell = isVortex && hasMist && hasCrystal && hasEmber && childrenHaveAllFourElements;
    const isShieldSpell = isVortex && (hasIce || hasEmber || hasSand) && !isHealingSpell;
    
    if (isHealingSpell) {
      effectType = "healing";
      // Healing power = base damage of all materials
      healing = childMaterials.reduce((sum, id) => {
        const child = comp.children?.find(c => (c.baseId || c.id) === id);
        return sum + (child?.baseDamage || 0);
      }, 0);
      healing = Math.max(healing, 5); // Minimum healing of 5
    } else if (isShieldSpell) {
      effectType = "shield";
      // Shield power = base damage of all materials * 2
      shield = childMaterials.reduce((sum, id) => {
        const child = comp.children?.find(c => (c.baseId || c.id) === id);
        return sum + (child?.baseDamage || 0);
      }, 0) * 2;
      shield = Math.max(shield, 5); // Minimum shield of 5
    }

    // Calculate damage for this container
    const cappedMultiplier = Math.min(damageMultiplier, 10);
    let containerDamage = Math.floor(baseDamage * cappedMultiplier);

    // Apply specialization damage bonus
    if (spec === "pyromancer" && elements.has("fire")) {
      containerDamage = Math.floor(containerDamage * 1.2);
    } else if (spec === "aquamancer" && elements.has("water")) {
      containerDamage = Math.floor(containerDamage * 1.2);
    }

    containerDamage = Math.min(containerDamage, 100);

    // Damage only counts if the container has propulsion (can target opponent)
    const validDamage = (effectType === "damage" && hasPropulsion) ? containerDamage : 0;

    return {
      damage: validDamage,
      shield: effectType === "shield" ? shield : 0,
      healing: effectType === "healing" ? healing : 0,
      componentCount,
      hasPropulsion,
      elements,
      effectType,
    };
  }

  const target = hasPropulsionInsideContainer ? "opponent" : "self";

  // Simple effect description based on what the spell does
  let finalEffectName = "Spell";
  if (totalDamage > 0 && totalShield > 0) {
    finalEffectName = "Attack + Shield";
  } else if (totalDamage > 0 && totalHealing > 0) {
    finalEffectName = "Attack + Heal";
  } else if (totalDamage > 0) {
    finalEffectName = "Attack";
  } else if (totalShield > 0) {
    finalEffectName = "Shield";
  } else if (totalHealing > 0) {
    finalEffectName = "Heal";
  }

  return { 
    damage: totalDamage, 
    shieldPower: totalShield,
    healingPower: totalHealing,
    effect: finalEffectName,
    target,
    hasValidPropulsion: hasPropulsionInsideContainer,
    componentsUsed,
  };
}

export function validateSpell(
  components: SpellComponent[], 
  playerHand: string[]
): { valid: boolean; error?: string } {
  if (components.length === 0) {
    return { valid: false, error: "Spell must have at least one component" };
  }
  
  // Check for duplicate component usage (each component can only be used once per round)
  const usedBaseIds = new Set<string>();
  const checkDuplicates = (comps: SpellComponent[]): boolean => {
    for (const comp of comps) {
      const baseId = comp.baseId || comp.id;
      // Skip containers and gust - they're always available
      if (comp.role === "container" || comp.role === "propulsion") {
        if (comp.children && !checkDuplicates(comp.children)) {
          return false;
        }
        continue;
      }
      if (usedBaseIds.has(baseId)) {
        return false; // Duplicate found
      }
      usedBaseIds.add(baseId);
      if (comp.children && !checkDuplicates(comp.children)) {
        return false;
      }
    }
    return true;
  };
  
  if (!checkDuplicates(components)) {
    return { valid: false, error: "Each component can only be used once per round" };
  }
  
  // Check that all used materials are in the player's hand
  const materialsUsed: string[] = [];
  const collectMaterials = (comps: SpellComponent[]) => {
    for (const comp of comps) {
      // Skip containers and gust
      if (comp.role !== "container" && comp.role !== "propulsion") {
        materialsUsed.push(comp.baseId || comp.id);
      }
      if (comp.children) {
        collectMaterials(comp.children);
      }
    }
  };
  collectMaterials(components);
  
  // Count occurrences in hand vs used
  const handCounts = new Map<string, number>();
  for (const id of playerHand) {
    handCounts.set(id, (handCounts.get(id) || 0) + 1);
  }
  
  const usedCounts = new Map<string, number>();
  for (const id of materialsUsed) {
    usedCounts.set(id, (usedCounts.get(id) || 0) + 1);
  }
  
  for (const [id, count] of usedCounts) {
    if ((handCounts.get(id) || 0) < count) {
      return { valid: false, error: `You don't have enough ${id} in your hand` };
    }
  }
  
  // Check for propulsion without container
  const hasPropulsionOutsideContainer = (comps: SpellComponent[], inContainer: boolean = false): boolean => {
    for (const comp of comps) {
      if (comp.role === "propulsion" && !inContainer) {
        return true;
      }
      if (comp.children && comp.role === "container") {
        if (hasPropulsionOutsideContainer(comp.children, true)) {
          return true;
        }
      } else if (comp.children) {
        if (hasPropulsionOutsideContainer(comp.children, inContainer)) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (hasPropulsionOutsideContainer(components)) {
    return { valid: false, error: "Propulsion components can only be applied to containers" };
  }
  
  // Check container capacity (max 4 children per container)
  const checkContainerCapacity = (comps: SpellComponent[]): boolean => {
    for (const comp of comps) {
      if (comp.role === "container" && comp.children && comp.children.length > 4) {
        return false;
      }
      if (comp.children && !checkContainerCapacity(comp.children)) {
        return false;
      }
    }
    return true;
  };
  
  if (!checkContainerCapacity(components)) {
    return { valid: false, error: "Containers can hold a maximum of 4 components" };
  }
  
  return { valid: true };
}

export function applyCombatDamage(state: GameState, damage: number, target: "player" | "opponent"): GameState {
  const newState = { ...state };
  
  if (target === "player") {
    newState.player = {
      ...newState.player,
      health: Math.max(0, newState.player.health - damage),
    };
  } else {
    newState.opponent = {
      ...newState.opponent,
      health: Math.max(0, newState.opponent.health - damage),
    };
  }
  
  return newState;
}

export function applySimultaneousDamage(state: GameState, damageToPlayer: number, damageToOpponent: number): GameState {
  const newState = { ...state };
  
  // Apply both damages simultaneously in a single operation
  newState.player = {
    ...newState.player,
    health: Math.max(0, newState.player.health - damageToPlayer),
  };
  
  newState.opponent = {
    ...newState.opponent,
    health: Math.max(0, newState.opponent.health - damageToOpponent),
  };
  
  return newState;
}

export function applyCombatResolution(
  state: GameState,
  playerSpell: { damage: number; shieldPower: number; healingPower: number; componentsUsed: number },
  aiSpell: { damage: number; shieldPower: number; healingPower: number; componentsUsed: number }
): GameState {
  let newState = { ...state };

  // Step 1: Calculate damage with shields
  const damageToPlayer = Math.max(0, aiSpell.damage - playerSpell.shieldPower);
  const damageToOpponent = Math.max(0, playerSpell.damage - aiSpell.shieldPower);

  // Step 2: Apply damage simultaneously
  newState = applySimultaneousDamage(newState, damageToPlayer, damageToOpponent);

  // Step 3: Apply healing
  newState.player = {
    ...newState.player,
    health: Math.min(newState.player.maxHealth, newState.player.health + playerSpell.healingPower),
  };

  newState.opponent = {
    ...newState.opponent,
    health: Math.min(newState.opponent.maxHealth, newState.opponent.health + aiSpell.healingPower),
  };

  return newState;
}

export function checkGameEnd(state: GameState): GameState {
  const newState = { ...state };
  
  const playerDead = newState.player.health <= 0;
  const opponentDead = newState.opponent.health <= 0;
  
  if (playerDead && opponentDead) {
    newState.gamePhase = "tie";
  } else if (playerDead) {
    newState.gamePhase = "defeat";
  } else if (opponentDead) {
    newState.gamePhase = "victory";
  }
  
  return newState;
}

export function replenishHand(
  state: GameState,
  target: "player" | "opponent",
  componentsUsed: number
): GameState {
  const newState = { ...state };
  
  if (!newState.componentPool) {
    newState.componentPool = [];
  }
  
  // Draw new components equal to what was used
  const drawCount = Math.min(componentsUsed, newState.componentPool.length);
  const drawn = newState.componentPool.slice(0, drawCount);
  const remaining = newState.componentPool.slice(drawCount);
  
  if (target === "player") {
    newState.player = {
      ...newState.player,
      hand: [...(newState.player.hand || []), ...drawn],
    };
  } else {
    newState.opponent = {
      ...newState.opponent,
      hand: [...(newState.opponent.hand || []), ...drawn],
    };
  }
  
  newState.componentPool = remaining;
  
  return newState;
}

export function removeUsedFromHand(
  mage: Mage,
  componentsUsed: string[]
): Mage {
  const newHand = [...(mage.hand || [])];
  
  for (const compId of componentsUsed) {
    const index = newHand.indexOf(compId);
    if (index !== -1) {
      newHand.splice(index, 1);
    }
  }
  
  return {
    ...mage,
    hand: newHand,
  };
}

export function nextRound(state: GameState): GameState {
  return {
    ...state,
    round: (state.round || 1) + 1,
    gamePhase: "building",
    playerSpellLocked: false,
    aiSpellLocked: false,
    lockedPlayerSpell: null,
    lockedAiSpell: null,
  };
}
