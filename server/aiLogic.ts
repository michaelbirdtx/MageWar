import { SpellComponent, Spell, MAX_SPELLS_PER_ROUND } from "@shared/schema";
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
// Names are generated dynamically by determineEffectNameBackend() based on elements
const damageSpells = [
  // Fire-based spells (favored by Pyromancers) - optimized 4-component builds
  {
    manaCost: 44, // Vortex 12 + Magma 12 + Ember 6 + Stone 6 + Gust 8 = 44
    elements: ["air", "fire", "earth"],
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      { ...availableComponents.find(c => c.id === "magma")! },  // 6 base damage
      { ...availableComponents.find(c => c.id === "ember")! },  // 2 base damage
      { ...availableComponents.find(c => c.id === "stone")! },  // 3x multiplier = 24 base, 28.8 with Pyro bonus
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
  {
    manaCost: 47, // Air Sphere 10 + Magma 12 + Flame 10 + Crystal 7 + Gust 8 = 47
    elements: ["air", "fire", "earth"],
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      { ...availableComponents.find(c => c.id === "magma")! },   // 6 base damage
      { ...availableComponents.find(c => c.id === "flame")! },   // 3 base damage
      { ...availableComponents.find(c => c.id === "crystal")! }, // 2x multiplier = 18 base, 21.6 with Pyro bonus
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
  {
    manaCost: 40, // Air Sphere 10 + Flame 10 + Ember 6 + Stone 6 + Gust 8 = 40
    elements: ["air", "fire", "earth"],
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      { ...availableComponents.find(c => c.id === "flame")! },  // 3 base damage
      { ...availableComponents.find(c => c.id === "ember")! },  // 2 base damage
      { ...availableComponents.find(c => c.id === "stone")! },  // 3x multiplier = 15 base, 18 with Pyro bonus
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
  // Water-based spells (favored by Aquamancers) - now with multipliers for high damage
  {
    manaCost: 46, // Vortex 12 + Boulder 10 + Frost 9 + Crystal 7 + Gust 8 = 46
    elements: ["air", "water", "earth"],
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      { ...availableComponents.find(c => c.id === "boulder")! }, // 5 base damage
      { ...availableComponents.find(c => c.id === "frost")! },   // 2 base damage
      { ...availableComponents.find(c => c.id === "crystal")! }, // 2x multiplier = 14 damage total
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
  {
    manaCost: 43, // Air Sphere 10 + Boulder 10 + Frost 9 + Stone 6 + Gust 8 = 43
    elements: ["air", "water", "earth"],
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      { ...availableComponents.find(c => c.id === "boulder")! }, // 5 base damage
      { ...availableComponents.find(c => c.id === "frost")! },   // 2 base damage
      { ...availableComponents.find(c => c.id === "stone")! },   // 3x multiplier = 21 damage total
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
  {
    manaCost: 38, // Air Sphere 10 + Storm 11 + Frost 9 + Gust 8 = 38
    elements: ["air", "water"],
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      { ...availableComponents.find(c => c.id === "storm")! },   // 5 base damage
      { ...availableComponents.find(c => c.id === "frost")! },   // 2 base damage = 7 total
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
  // Generic high-damage spells
  {
    manaCost: 34, // Air Sphere 10 + Boulder 10 + Stone 6 + Gust 8 = 34
    elements: ["air", "earth"],
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      { ...availableComponents.find(c => c.id === "boulder")! }, // 5 base damage
      { ...availableComponents.find(c => c.id === "stone")! },   // 3x multiplier
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
  {
    manaCost: 38, // Air Sphere 10 + Lightning 9 + Storm 11 + Gust 8 = 38
    elements: ["air"],
    components: [{ ...availableComponents.find(c => c.id === "air-sphere")!, children: [
      { ...availableComponents.find(c => c.id === "lightning")! }, // 4 base damage
      { ...availableComponents.find(c => c.id === "storm")! },     // 5 base damage
      { ...availableComponents.find(c => c.id === "gust")! },
    ]}],
  },
];

const shieldSpells = [
  {
    manaCost: 20, // Vortex 12 + Ice 8
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      { ...availableComponents.find(c => c.id === "ice")! },
    ]}],
  },
  {
    manaCost: 18, // Vortex 12 + Ember 6
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      { ...availableComponents.find(c => c.id === "ember")! },
    ]}],
  },
  {
    manaCost: 16, // Vortex 12 + Sand 4
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      { ...availableComponents.find(c => c.id === "sand")! },
    ]}],
  },
];

const healingSpells = [
  {
    manaCost: 39, // Vortex 12 + Mist 5 + Crystal 7 + Ember 6 + Lightning 9
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      { ...availableComponents.find(c => c.id === "mist")! },
      { ...availableComponents.find(c => c.id === "crystal")! },
      { ...availableComponents.find(c => c.id === "ember")! },
      { ...availableComponents.find(c => c.id === "lightning")! },
    ]}],
  },
  {
    manaCost: 41, // Vortex 12 + Mist 5 + Crystal 7 + Ember 6 + Storm 11
    components: [{ ...availableComponents.find(c => c.id === "vortex")!, children: [
      { ...availableComponents.find(c => c.id === "mist")! },
      { ...availableComponents.find(c => c.id === "crystal")! },
      { ...availableComponents.find(c => c.id === "ember")! },
      { ...availableComponents.find(c => c.id === "storm")! },
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

  // Strategic mode: Build up to MAX_SPELLS_PER_ROUND containers based on situation
  const containers: SpellComponent[] = [];
  let remainingMana = availableMana;
  const usedComponentIds = new Set<string>(); // Track used base component IDs

  // Determine strategy based on health
  const healthRatio = aiHealth && playerHealth ? aiHealth / playerHealth : 1;
  const needsHealing = healthRatio < 0.6;
  const needsDefense = healthRatio < 0.8;

  // Priority 1: Always try to deal damage
  const damageSpell = selectBestAffordableSpell(damageSpells, remainingMana, specialization, usedComponentIds);
  if (damageSpell && containers.length < MAX_SPELLS_PER_ROUND) {
    containers.push(...deepCloneComponents(damageSpell.components));
    addComponentIdsToSet(damageSpell.components, usedComponentIds);
    remainingMana -= damageSpell.manaCost;
  }

  // Priority 2: Add healing if critically low health (and haven't reached max spells)
  if (needsHealing && remainingMana >= 20 && containers.length < MAX_SPELLS_PER_ROUND) {
    const healSpell = selectBestAffordableSpell(healingSpells, remainingMana, specialization, usedComponentIds);
    if (healSpell) {
      containers.push(...deepCloneComponents(healSpell.components));
      addComponentIdsToSet(healSpell.components, usedComponentIds);
      remainingMana -= healSpell.manaCost;
    }
  }

  // Priority 3: Add second damage spell if health is good and mana allows (AGGRESSIVE - lowered threshold from 25 to 20 mana)
  if (!needsHealing && remainingMana >= 20 && containers.length < MAX_SPELLS_PER_ROUND) {
    const secondDamage = selectBestAffordableSpell(damageSpells, remainingMana, specialization, usedComponentIds);
    if (secondDamage) {
      containers.push(...deepCloneComponents(secondDamage.components));
      addComponentIdsToSet(secondDamage.components, usedComponentIds);
      remainingMana -= secondDamage.manaCost;
    }
  }

  // Priority 4: Add shield if in danger or have extra mana (and haven't reached max spells)
  if ((needsDefense || remainingMana >= 16) && remainingMana >= 16 && containers.length < MAX_SPELLS_PER_ROUND) {
    const shieldSpell = selectBestAffordableSpell(shieldSpells, remainingMana, specialization, usedComponentIds);
    if (shieldSpell) {
      containers.push(...deepCloneComponents(shieldSpell.components));
      addComponentIdsToSet(shieldSpell.components, usedComponentIds);
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

// Helper to extract all component IDs from a spell template
function getComponentIds(components: SpellComponent[]): Set<string> {
  const ids = new Set<string>();
  const traverse = (comp: SpellComponent) => {
    ids.add(comp.baseId || comp.id);
    comp.children?.forEach(traverse);
  };
  components.forEach(traverse);
  return ids;
}

// Helper to add component IDs to the used set
function addComponentIdsToSet(components: SpellComponent[], usedSet: Set<string>): void {
  const ids = getComponentIds(components);
  ids.forEach(id => usedSet.add(id));
}

// Helper to check if a spell uses any already-used components
function hasComponentConflict(components: SpellComponent[], usedIds: Set<string>): boolean {
  const spellIds = getComponentIds(components);
  for (const id of Array.from(spellIds)) {
    if (usedIds.has(id)) {
      return true;
    }
  }
  return false;
}

function selectBestAffordableSpell(
  spellList: Array<{ manaCost: number; components: SpellComponent[]; elements?: string[] }>,
  maxMana: number,
  specialization?: "pyromancer" | "aquamancer",
  usedComponentIds?: Set<string>
): { manaCost: number; components: SpellComponent[]; elements?: string[] } | null {
  // Filter affordable spells that don't reuse components
  const affordable = spellList.filter(s => {
    if (s.manaCost > maxMana) return false;
    if (usedComponentIds && hasComponentConflict(s.components, usedComponentIds)) return false;
    return true;
  });
  
  if (affordable.length === 0) return null;

  // Prioritize spells matching specialization by element composition
  const matching = affordable.filter(s => {
    if (!s.elements) return false;
    
    if (specialization === "pyromancer") {
      return s.elements.includes("fire");
    } else if (specialization === "aquamancer") {
      return s.elements.includes("water");
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
  const containers: SpellComponent[] = [];
  let remainingMana = availableMana;
  const usedComponentIds = new Set<string>();

  // Randomly pick 1 to MAX_SPELLS_PER_ROUND containers
  const numContainers = Math.random() < 0.5 ? 1 : MAX_SPELLS_PER_ROUND;

  for (let i = 0; i < numContainers && containers.length < MAX_SPELLS_PER_ROUND; i++) {
    // Filter spells that are affordable and don't reuse components
    const affordable = allSpellTypes.filter(s => {
      if (s.manaCost > remainingMana) return false;
      if (hasComponentConflict(s.components, usedComponentIds)) return false;
      return true;
    });
    
    if (affordable.length === 0) break;
    
    const spell = affordable[Math.floor(Math.random() * affordable.length)];
    containers.push(...deepCloneComponents(spell.components));
    addComponentIdsToSet(spell.components, usedComponentIds);
    remainingMana -= spell.manaCost;
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
    baseId: comp.baseId || comp.id, // Preserve baseId or set it from original id
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
