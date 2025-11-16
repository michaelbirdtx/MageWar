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
  };
}

export function calculateSpellStats(
  components: SpellComponent[], 
  specialization?: Specialization
): { 
  damage: number; 
  manaCost: number; 
  effect: string;
  target: "self" | "opponent";
  hasValidPropulsion: boolean;
} {
  let baseDamageSum = 0;
  let damageMultiplierProduct = 1;
  let manaCost = 0;
  let hasPropulsionInsideContainer = false;
  
  const calcComponent = (comp: SpellComponent, inContainer: boolean = false) => {
    // Apply specialization cost reduction (20% reduction for matching element)
    let componentCost = comp.manaCost;
    if (specialization === "pyromancer" && comp.element === "fire") {
      componentCost = Math.floor(componentCost * 0.8);
    } else if (specialization === "aquamancer" && comp.element === "water") {
      componentCost = Math.floor(componentCost * 0.8);
    }
    manaCost += componentCost;
    
    baseDamageSum += comp.baseDamage;
    damageMultiplierProduct *= comp.damageMultiplier;
    
    if (comp.role === "propulsion" && inContainer) {
      hasPropulsionInsideContainer = true;
    }
    
    if (comp.children) {
      comp.children.forEach(child => calcComponent(child, comp.role === "container"));
    }
  };
  
  components.forEach(comp => calcComponent(comp, false));
  
  // Cap multiplier to prevent extreme damage spikes
  const cappedMultiplier = Math.min(damageMultiplierProduct, 10);
  
  // Calculate base damage
  let uncappedDamage = Math.floor(baseDamageSum * cappedMultiplier);
  
  // Apply specialization damage bonus (20% increase for matching element)
  if (specialization) {
    const hasMatchingElement = (element: string) => 
      components.some(c => c.element === element || c.children?.some(ch => ch.element === element));
    
    if (specialization === "pyromancer" && hasMatchingElement("fire")) {
      uncappedDamage = Math.floor(uncappedDamage * 1.2);
    } else if (specialization === "aquamancer" && hasMatchingElement("water")) {
      uncappedDamage = Math.floor(uncappedDamage * 1.2);
    }
  }
  
  // Apply hard cap at 100
  const damage = Math.min(uncappedDamage, 100);
  
  // Determine target: only targets opponent if propulsion is properly nested in container
  const target = hasPropulsionInsideContainer ? "opponent" : "self";
  
  // Determine effect name
  const hasFire = components.some(c => c.element === "fire" || c.children?.some(ch => ch.element === "fire"));
  const hasWater = components.some(c => c.element === "water" || c.children?.some(ch => ch.element === "water"));
  const hasEarth = components.some(c => c.element === "earth" || c.children?.some(ch => ch.element === "earth"));
  const hasAir = components.some(c => c.element === "air" || c.children?.some(ch => ch.element === "air"));
  
  let effect = "Basic Spell";
  
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
    hasValidPropulsion: hasPropulsionInsideContainer
  };
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
    
    if (newState.player.health <= 0) {
      newState.gamePhase = "defeat";
    }
  } else {
    newState.opponent = {
      ...newState.opponent,
      health: Math.max(0, newState.opponent.health - damage),
    };
    
    if (newState.opponent.health <= 0) {
      newState.gamePhase = "victory";
    }
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

export function switchTurn(state: GameState): GameState {
  const newTurn = state.currentTurn === "player" ? "opponent" : "player";
  
  return {
    ...state,
    currentTurn: newTurn,
    player: newTurn === "player" ? restoreMana(state.player, state.player.manaRegen) : state.player,
    opponent: newTurn === "opponent" ? restoreMana(state.opponent, state.opponent.manaRegen) : state.opponent,
  };
}
