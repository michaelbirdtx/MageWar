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

export function calculateSpellStats(components: SpellComponent[]): { damage: number; manaCost: number; effect: string } {
  let damage = 0;
  let manaCost = 0;
  
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
  
  let effect = "Basic Spell";
  
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
  } else if (hasFire && hasAir) {
    effect = "Flame Gust";
    damage = Math.floor(damage * 1.25);
  } else if (hasEarth && hasAir) {
    effect = "Sand Storm";
    damage = Math.floor(damage * 1.15);
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

export function validateSpell(components: SpellComponent[], playerMana: number): { valid: boolean; error?: string } {
  if (components.length === 0) {
    return { valid: false, error: "Spell must have at least one component" };
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
