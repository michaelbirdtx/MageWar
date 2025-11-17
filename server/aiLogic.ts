import { SpellComponent, Spell } from "@shared/schema";
import { randomUUID } from "crypto";
import { calculateSpellStats } from "./gameLogic";

const availableComponents: SpellComponent[] = [
  // Air Elements
  { id: "air-sphere", name: "Air Sphere", element: "air", type: "container", role: "container", description: "Hollow sphere of compressed air", manaCost: 10, baseDamage: 0, damageMultiplier: 1 },
  { id: "gust", name: "Gust", element: "air", type: "action", role: "propulsion", description: "Propels objects forward", manaCost: 8, baseDamage: 0, damageMultiplier: 1 },
  { id: "vortex", name: "Vortex", element: "air", type: "container", role: "container", description: "Swirling air container", manaCost: 12, baseDamage: 0, damageMultiplier: 1 },
  { id: "lightning", name: "Lightning", element: "air", type: "material", role: "material", description: "Electrical discharge", manaCost: 9, baseDamage: 4, damageMultiplier: 1 },
  { id: "storm", name: "Storm", element: "air", type: "material", role: "material", description: "Violent tempest", manaCost: 11, baseDamage: 5, damageMultiplier: 1 },
  
  // Earth Elements
  { id: "boulder", name: "Boulder", element: "earth", type: "material", role: "material", description: "Massive rock", manaCost: 10, baseDamage: 5, damageMultiplier: 1 },
  { id: "crystal", name: "Crystal", element: "earth", type: "material", role: "material", description: "Amplifies magical energy", manaCost: 7, baseDamage: 0, damageMultiplier: 2 },
  { id: "sand", name: "Sand", element: "earth", type: "material", role: "material", description: "Fine granular material", manaCost: 4, baseDamage: 0, damageMultiplier: 2 },
  { id: "stone", name: "Stone", element: "earth", type: "material", role: "material", description: "Dense rock fragment", manaCost: 6, baseDamage: 0, damageMultiplier: 3 },
  { id: "sulfur", name: "Sulfur", element: "earth", type: "material", role: "material", description: "Highly flammable mineral", manaCost: 8, baseDamage: 0, damageMultiplier: 4 },
  
  // Fire Elements
  { id: "ember", name: "Ember", element: "fire", type: "material", role: "activation", description: "Smoldering heat source", manaCost: 6, baseDamage: 2, damageMultiplier: 1 },
  { id: "flame", name: "Flame", element: "fire", type: "material", role: "activation", description: "Pure elemental fire", manaCost: 10, baseDamage: 3, damageMultiplier: 1 },
  { id: "magma", name: "Magma", element: "fire", type: "material", role: "material", description: "Molten rock essence", manaCost: 12, baseDamage: 6, damageMultiplier: 1 },
  { id: "spark", name: "Spark", element: "fire", type: "action", role: "activation", description: "Ignites flammable materials", manaCost: 5, baseDamage: 1, damageMultiplier: 1 },
  
  // Water Elements
  { id: "frost", name: "Frost", element: "water", type: "action", role: "activation", description: "Freezes on contact", manaCost: 9, baseDamage: 2, damageMultiplier: 1 },
  { id: "ice", name: "Ice", element: "water", type: "material", role: "material", description: "Frozen crystalline structure", manaCost: 8, baseDamage: 0, damageMultiplier: 1.5 },
  { id: "mist", name: "Mist", element: "water", type: "material", role: "material", description: "Gentle water vapor", manaCost: 5, baseDamage: 0, damageMultiplier: 1 },
];

// Individual container templates for building multi-spell combinations
const damageSpells = [
  {
    name: "Fireball",
    manaCost: 23,
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      availableComponents.find(c => c.id === "sulfur")!,
      availableComponents.find(c => c.id === "spark")!,
      availableComponents.find(c => c.id === "gust")!,
    ]}],
  },
  {
    name: "Frost Bolt",
    manaCost: 27,
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      availableComponents.find(c => c.id === "frost")!,
      availableComponents.find(c => c.id === "mist")!,
      availableComponents.find(c => c.id === "gust")!,
    ]}],
  },
  {
    name: "Stone Strike",
    manaCost: 24,
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      availableComponents.find(c => c.id === "stone")!,
      availableComponents.find(c => c.id === "sand")!,
      availableComponents.find(c => c.id === "gust")!,
    ]}],
  },
  {
    name: "Volcanic Blast",
    manaCost: 32,
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      availableComponents.find(c => c.id === "sulfur")!,
      availableComponents.find(c => c.id === "flame")!,
      availableComponents.find(c => c.id === "gust")!,
    ]}],
  },
];

const shieldSpells = [
  {
    name: "Ice Shield",
    manaCost: 20,
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      availableComponents.find(c => c.id === "ice")!,
    ]}],
  },
  {
    name: "Ember Shield",
    manaCost: 18,
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      availableComponents.find(c => c.id === "ember")!,
    ]}],
  },
  {
    name: "Sand Shield",
    manaCost: 16,
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      availableComponents.find(c => c.id === "sand")!,
    ]}],
  },
];

const healingSpells = [
  {
    name: "Restoration",
    manaCost: 38,
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      availableComponents.find(c => c.id === "mist")!,
      availableComponents.find(c => c.id === "crystal")!,
      availableComponents.find(c => c.id === "ember")!,
      availableComponents.find(c => c.id === "lightning")!,
    ]}],
  },
  {
    name: "Life Force",
    manaCost: 40,
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      availableComponents.find(c => c.id === "mist")!,
      availableComponents.find(c => c.id === "crystal")!,
      availableComponents.find(c => c.id === "ember")!,
      availableComponents.find(c => c.id === "storm")!,
    ]}],
  },
];

export function generateAISpell(
  availableMana: number, 
  difficulty: number = 0.9,
  specialization?: "pyromancer" | "aquamancer",
  aiHealth?: number,
  playerHealth?: number
): SpellComponent[] {
  // 20% chance to enter experimental mode
  const isExperimental = Math.random() < 0.2;

  if (isExperimental) {
    return generateExperimentalSpell(availableMana, specialization);
  }

  // Strategic mode: Build 1-3 containers based on situation
  const containers: SpellComponent[] = [];
  let remainingMana = availableMana;

  // Determine strategy based on health
  const healthRatio = aiHealth && playerHealth ? aiHealth / playerHealth : 1;
  const needsHealing = healthRatio < 0.6;
  const needsDefense = healthRatio < 0.8;

  // Priority 1: Always try to deal damage
  const damageSpell = selectBestAffordableSpell(damageSpells, remainingMana, specialization);
  if (damageSpell) {
    containers.push(...deepCloneComponents(damageSpell.components));
    remainingMana -= damageSpell.manaCost;
  }

  // Priority 2: Add healing if low health
  if (needsHealing && remainingMana >= 20) {
    const healSpell = selectBestAffordableSpell(healingSpells, remainingMana, specialization);
    if (healSpell) {
      containers.push(...deepCloneComponents(healSpell.components));
      remainingMana -= healSpell.manaCost;
    }
  }

  // Priority 3: Add shield if in danger or have extra mana
  if ((needsDefense || remainingMana >= 25) && remainingMana >= 20) {
    const shieldSpell = selectBestAffordableSpell(shieldSpells, remainingMana, specialization);
    if (shieldSpell) {
      containers.push(...deepCloneComponents(shieldSpell.components));
      remainingMana -= shieldSpell.manaCost;
    }
  }

  // Validate the complete spell
  if (containers.length > 0) {
    const stats = calculateSpellStats(containers, specialization);
    if (stats.manaCost <= availableMana && stats.hasValidPropulsion) {
      return assignUniqueIds(containers);
    }
  }

  // Fallback: Try single damage spell
  for (const spell of damageSpells) {
    const components = deepCloneComponents(spell.components);
    const stats = calculateSpellStats(components, specialization);
    if (stats.manaCost <= availableMana && stats.hasValidPropulsion) {
      return assignUniqueIds(components);
    }
  }

  return [];
}

function selectBestAffordableSpell(
  spellList: Array<{ name: string; manaCost: number; components: SpellComponent[] }>,
  maxMana: number,
  specialization?: "pyromancer" | "aquamancer"
): { name: string; manaCost: number; components: SpellComponent[] } | null {
  // Filter affordable spells
  const affordable = spellList.filter(s => s.manaCost <= maxMana);
  if (affordable.length === 0) return null;

  // Prioritize spells matching specialization
  const matching = affordable.filter(s => {
    if (specialization === "pyromancer") {
      return s.name.toLowerCase().includes("fire") || s.name.toLowerCase().includes("flame") || s.name.toLowerCase().includes("volcanic");
    } else if (specialization === "aquamancer") {
      return s.name.toLowerCase().includes("frost") || s.name.toLowerCase().includes("ice") || s.name.toLowerCase().includes("water");
    }
    return false;
  });

  // Return matching spell or random affordable spell
  const pool = matching.length > 0 ? matching : affordable;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateExperimentalSpell(
  availableMana: number,
  specialization?: "pyromancer" | "aquamancer"
): SpellComponent[] {
  // Experimental mode: Build creative/unusual combinations
  const allSpellTypes = [...damageSpells, ...shieldSpells, ...healingSpells];
  const affordable = allSpellTypes.filter(s => s.manaCost <= availableMana);

  if (affordable.length === 0) return [];

  // Randomly pick 1-2 containers
  const numContainers = Math.random() < 0.5 ? 1 : 2;
  const containers: SpellComponent[] = [];
  let remainingMana = availableMana;

  for (let i = 0; i < numContainers && affordable.length > 0; i++) {
    const spell = affordable[Math.floor(Math.random() * affordable.length)];
    if (spell.manaCost <= remainingMana) {
      containers.push(...deepCloneComponents(spell.components));
      remainingMana -= spell.manaCost;
    }
  }

  if (containers.length > 0) {
    const stats = calculateSpellStats(containers, specialization);
    if (stats.manaCost <= availableMana) {
      return assignUniqueIds(containers);
    }
  }

  return [];
}

function deepCloneComponents(components: SpellComponent[]): SpellComponent[] {
  return components.map(comp => ({
    ...comp,
    children: comp.children ? deepCloneComponents(comp.children) : undefined,
  }));
}

function assignUniqueIds(components: SpellComponent[]): SpellComponent[] {
  return components.map(comp => ({
    ...comp,
    id: `${comp.id}-${randomUUID()}`,
    children: comp.children ? assignUniqueIds(comp.children) : undefined,
  }));
}

export function getAIDifficulty(opponentHealth: number, playerHealth: number): number {
  // AI is consistently aggressive, increasing further when losing
  if (opponentHealth < playerHealth * 0.5) {
    return 1.0; // Always use best spell when losing badly
  } else if (opponentHealth < playerHealth * 0.75) {
    return 0.95; // Almost always use best spell when behind
  }
  return 0.9; // Default: use best spell 90% of the time
}
