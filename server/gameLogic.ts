import { GameState, Mage, SpellComponent, Spell, Specialization } from "@shared/schema";
import { randomUUID } from "crypto";

export interface CharacterAttributes {
  name: string;
  intellect: number;
  stamina: number;
  wisdom: number;
  specialization: Specialization;
}

function calculateMaxHealth(stamina: number): number {
  // Base health of 50, +10 per stamina point
  return 50 + (stamina * 10);
}

function calculateMaxMana(intellect: number): number {
  // Base mana of 40, +8 per intellect point
  return 40 + (intellect * 8);
}

function calculateManaRegen(wisdom: number): number {
  // Base regen of 5, +2 per wisdom point
  return 5 + (wisdom * 2);
}

function createMageFromAttributes(attributes: CharacterAttributes, isPlayer: boolean): Mage {
  const maxHealth = calculateMaxHealth(attributes.stamina);
  const maxMana = calculateMaxMana(attributes.intellect);
  const manaRegen = calculateManaRegen(attributes.wisdom);
  
  return {
    id: randomUUID(),
    name: attributes.name,
    health: maxHealth,
    maxHealth,
    mana: maxMana,
    maxMana,
    manaRegen,
    intellect: attributes.intellect,
    stamina: attributes.stamina,
    wisdom: attributes.wisdom,
    specialization: attributes.specialization,
    isPlayer,
  };
}

function generateAICharacterAttributes(): CharacterAttributes {
  // AI chooses specialization randomly
  const specializations: Specialization[] = ["pyromancer", "aquamancer"];
  const specialization = specializations[Math.floor(Math.random() * specializations.length)];
  
  // AI distributes 6 free points strategically
  // For pyromancers: prioritize intellect (more mana for fire spells)
  // For aquamancers: prioritize intellect and wisdom (mana and regen)
  const baseAttributes = { intellect: 10, stamina: 10, wisdom: 10 };
  
  if (specialization === "pyromancer") {
    baseAttributes.intellect += 3; // More mana for aggressive fire spells
    baseAttributes.stamina += 2;   // Some survivability
    baseAttributes.wisdom += 1;    // Minimal regen
  } else {
    baseAttributes.intellect += 2; // Good mana pool
    baseAttributes.stamina += 2;   // Balanced survivability
    baseAttributes.wisdom += 2;    // Good mana regen for sustained combat
  }
  
  return {
    name: "Dark Sorcerer",
    ...baseAttributes,
    specialization,
  };
}

export function createInitialGameState(playerAttributes: CharacterAttributes): GameState {
  const aiAttributes = generateAICharacterAttributes();
  
  return {
    player: createMageFromAttributes(playerAttributes, true),
    opponent: createMageFromAttributes(aiAttributes, false),
    currentTurn: "player",
    gamePhase: "building",
    playerSpellLocked: false,
    aiSpellLocked: false,
    lockedPlayerSpell: null,
    lockedAiSpell: null,
  };
}

export function calculateSpellStats(
  components: SpellComponent[], 
  specialization?: Specialization
): { 
  damage: number; 
  shieldPower: number;
  healingPower: number;
  manaCost: number; 
  effect: string;
  target: "self" | "opponent";
  hasValidPropulsion: boolean;
  bonus: number;
} {
  let totalDamage = 0;
  let totalShield = 0;
  let totalHealing = 0;
  let totalManaCost = 0;
  let totalBonus = 0;
  let hasPropulsionInsideContainer = false;
  const allElements = new Set<string>();
  const allMaterials = new Set<string>();
  const effectTypes = new Set<string>();
  const damageSpellNames: string[] = [];
  const shieldSpellNames: string[] = [];
  const healingSpellNames: string[] = [];

  // Process each top-level container
  components.forEach((comp) => {
    const result = processContainer(comp, specialization);
    totalDamage += result.damage;
    totalShield += result.shield;
    totalHealing += result.healing;
    totalManaCost += result.manaCost;
    
    if (result.hasPropulsion) hasPropulsionInsideContainer = true;
    result.elements.forEach(e => allElements.add(e));
    result.materials.forEach(m => allMaterials.add(m));
    if (result.effectType) effectTypes.add(result.effectType);
    
    // Generate spell name per-container based on its own materials
    const containerElements = Array.from(result.elements);
    const containerMaterials = result.materials;
    const containerEffectType = new Set<string>([result.effectType]);
    const { effectName, bonus } = determineEffectNameBackend(
      containerElements, 
      containerEffectType, 
      result.hasPropulsion, 
      containerMaterials
    );
    
    // Only add to spell names if this container has valid propulsion or is a shield/healing spell
    // Non-propulsion damage containers don't count toward spell names
    if (result.effectType === "damage" && result.hasPropulsion) {
      damageSpellNames.push(effectName);
      totalBonus += bonus;
    } else if (result.effectType === "shield") {
      shieldSpellNames.push(effectName);
      totalBonus += bonus;
    } else if (result.effectType === "healing") {
      healingSpellNames.push(effectName);
      totalBonus += bonus;
    }
    // If effectType is "damage" but no propulsion, this container is invalid and contributes nothing
  });

  function processContainer(comp: SpellComponent, spec?: Specialization): {
    damage: number;
    shield: number;
    healing: number;
    manaCost: number;
    hasPropulsion: boolean;
    elements: Set<string>;
    materials: Set<string>;
    effectType: string;
  } {
    let baseDamage = comp.baseDamage;
    let damageMultiplier = comp.damageMultiplier;
    let shield = comp.shieldPower || 0;
    let healing = comp.healingPower || 0;
    let componentCost = comp.manaCost;
    let hasPropulsion = false;
    const elements = new Set<string>([comp.element]);
    const materials = new Set<string>();
    let effectType = comp.effectType || "damage";

    // Apply specialization cost reduction
    if (spec === "pyromancer" && comp.element === "fire") {
      componentCost = Math.floor(componentCost * 0.8);
    } else if (spec === "aquamancer" && comp.element === "water") {
      componentCost = Math.floor(componentCost * 0.8);
    }

    let manaCost = componentCost;
    const childMaterials: string[] = [];
    const childElements = new Set<string>();

    // Process children
    if (comp.children) {
      comp.children.forEach((child) => {
        baseDamage += child.baseDamage;
        damageMultiplier *= child.damageMultiplier;
        shield += child.shieldPower || 0;
        healing += child.healingPower || 0;
        
        let childCost = child.manaCost;
        if (spec === "pyromancer" && child.element === "fire") {
          childCost = Math.floor(childCost * 0.8);
        } else if (spec === "aquamancer" && child.element === "water") {
          childCost = Math.floor(childCost * 0.8);
        }
        manaCost += childCost;
        
        elements.add(child.element);
        childElements.add(child.element);
        const materialId = child.baseId || child.id;
        childMaterials.push(materialId); // Use baseId for pattern matching
        materials.add(materialId);
        
        if (child.role === "propulsion" && comp.role === "container") {
          hasPropulsion = true;
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
      // Healing power = sum of child mana costs
      healing = childMaterials.reduce((sum, id) => {
        const child = comp.children?.find(c => (c.baseId || c.id) === id);
        return sum + (child?.manaCost || 0);
      }, 0);
    } else if (isShieldSpell) {
      effectType = "shield";
      // Shield power = sum of child mana costs
      shield = childMaterials.reduce((sum, id) => {
        const child = comp.children?.find(c => (c.baseId || c.id) === id);
        return sum + (child?.manaCost || 0);
      }, 0);
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
    // Without propulsion, damage containers are invalid and contribute nothing
    const validDamage = (effectType === "damage" && hasPropulsion) ? containerDamage : 0;

    return {
      damage: validDamage,
      shield: effectType === "shield" ? shield : 0,
      healing: effectType === "healing" ? healing : 0,
      manaCost,
      hasPropulsion,
      elements,
      materials,
      effectType,
    };
  }

  const target = hasPropulsionInsideContainer ? "opponent" : "self";

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
    bonus: totalBonus,
  };
}

function determineEffectNameBackend(
  elements: string[],
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
    } else if (has("magma", "sand", "crystal", "stone")) {
      effectName = "Obsidian Cascade";
      bonus = 6;
    } else if (has("lightning", "storm", "sand", "crystal")) {
      effectName = "Fulgurite Tempest";
      bonus = 6;
    }
    // 3 Material Combinations
    else if (has("magma", "sulfur", "crystal")) {
      effectName = "Volcanic Crystal";
      bonus = 5;
    } else if (has("sand", "crystal", "stone")) {
      effectName = "Crystal Sandstorm";
      bonus = 5;
    } else if (has("sand", "crystal", "lightning")) {
      effectName = "Glass Shard Storm";
      bonus = 5;
    } else if (has("magma", "sand", "crystal")) {
      effectName = "Molten Glass";
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
    } else if (has("sand", "stone", "sulfur")) {
      effectName = "Volcanic Sand";
      bonus = 4;
    } else if (has("storm", "sand", "lightning")) {
      effectName = "Sandstorm Surge";
      bonus = 4;
    } else if (has("boulder", "sand", "stone")) {
      effectName = "Earthen Avalanche";
      bonus = 4;
    } else if (has("boulder", "stone", "lightning")) {
      effectName = "Thunder Crash";
      bonus = 4;
    } else if (has("boulder", "stone", "sulfur")) {
      effectName = "Sulfur Barrage";
      bonus = 4;
    } else if (has("boulder", "lightning", "storm")) {
      effectName = "Thunder Boulder";
      bonus = 4;
    } else if (has("stone", "lightning", "storm")) {
      effectName = "Thunder Stone";
      bonus = 4;
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
    } else if (has("sand", "crystal")) {
      effectName = "Crystal Sand";
      bonus = 3;
    } else if (has("sand", "stone")) {
      effectName = "Stone Barrage";
      bonus = 3;
    } else if (has("sand", "lightning")) {
      effectName = "Fulgurite Strike";
      bonus = 3;
    } else if (has("sand", "magma")) {
      effectName = "Glass Blast";
      bonus = 3;
    } else if (has("sand", "storm")) {
      effectName = "Sandstorm";
      bonus = 3;
    } else if (has("boulder", "sand")) {
      effectName = "Rock Slide";
      bonus = 3;
    } else if (has("boulder", "lightning")) {
      effectName = "Lightning Boulder";
      bonus = 3;
    } else if (has("boulder", "storm")) {
      effectName = "Storm Boulder";
      bonus = 3;
    } else if (has("boulder", "sulfur")) {
      effectName = "Sulfuric Rock";
      bonus = 3;
    } else if (has("stone", "lightning")) {
      effectName = "Lightning Stone";
      bonus = 3;
    } else if (has("stone", "storm")) {
      effectName = "Storm Stone";
      bonus = 3;
    } else if (has("stone", "magma")) {
      effectName = "Molten Stone";
      bonus = 3;
    } else if (has("stone", "frost")) {
      effectName = "Frozen Stone";
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

export function validateSpell(
  components: SpellComponent[], 
  playerMana: number,
  specialization?: Specialization
): { valid: boolean; error?: string } {
  if (components.length === 0) {
    return { valid: false, error: "Spell must have at least one component" };
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
  
  const { manaCost } = calculateSpellStats(components, specialization);
  
  if (manaCost > playerMana) {
    return { valid: false, error: `Not enough mana. Need ${manaCost}, have ${playerMana}` };
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
  playerSpell: { damage: number; shieldPower: number; healingPower: number; bonus: number },
  aiSpell: { damage: number; shieldPower: number; healingPower: number; bonus: number }
): GameState {
  let newState = { ...state };

  // Step 1: Apply bonus damage
  const playerDamage = playerSpell.damage + playerSpell.bonus;
  const aiDamage = aiSpell.damage + aiSpell.bonus;

  // Step 2: Reduce damage by shields
  const damageToPlayer = Math.max(0, aiDamage - playerSpell.shieldPower);
  const damageToOpponent = Math.max(0, playerDamage - aiSpell.shieldPower);

  // Step 3: Apply damage simultaneously
  newState = applySimultaneousDamage(newState, damageToPlayer, damageToOpponent);

  // Step 4: Apply healing
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

export function consumeMana(mage: Mage, amount: number): Mage {
  return {
    ...mage,
    mana: Math.max(0, mage.mana - amount),
  };
}

export function restoreMana(mage: Mage, amount: number): Mage {
  return {
    ...mage,
    mana: Math.min(mage.maxMana, mage.mana + amount),
  };
}

export function regenerateMana(mage: Mage): Mage {
  return restoreMana(mage, mage.manaRegen);
}

export function switchTurn(state: GameState): GameState {
  const newTurn = state.currentTurn === "player" ? "opponent" : "player";
  
  return {
    ...state,
    currentTurn: newTurn,
    player: newTurn === "player" ? restoreMana(state.player, state.player.manaRegen) : state.player,
    opponent: newTurn === "opponent" ? restoreMana(state.opponent, state.opponent.manaRegen) : state.opponent,
  };
}
