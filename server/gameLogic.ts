import { GameState, Mage, SpellComponent, Spell } from "@shared/schema";
import { randomUUID } from "crypto";

export function createInitialGameState(): GameState {
  return {
    player: {
      id: randomUUID(),
      name: "Player Mage",
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      isPlayer: true,
    },
    opponent: {
      id: randomUUID(),
      name: "Dark Sorcerer",
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      isPlayer: false,
    },
    currentTurn: "player",
    gamePhase: "building",
  };
}

export function calculateSpellStats(components: SpellComponent[]): { 
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
    manaCost += comp.manaCost;
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
  
  // Calculate final damage with a hard cap at 100
  const uncappedDamage = Math.floor(baseDamageSum * cappedMultiplier);
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

export function validateSpell(components: SpellComponent[], playerMana: number): { valid: boolean; error?: string } {
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
  
  const { manaCost } = calculateSpellStats(components);
  
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
    player: newTurn === "player" ? restoreMana(state.player, 15) : state.player,
    opponent: newTurn === "opponent" ? restoreMana(state.opponent, 15) : state.opponent,
  };
}
