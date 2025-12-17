import { SpellComponent, Spell, MAX_SPELLS_PER_ROUND, Specialization } from "@shared/schema";
import { randomUUID } from "crypto";
import { calculateSpellStats } from "./gameLogic";

// Component definitions for AI spell building
const componentDefinitions: Record<string, SpellComponent> = {
  // Containers (always available)
  "air-sphere": { id: "air-sphere", name: "Air Sphere", element: "air", type: "container", role: "container", description: "Hollow sphere of compressed air", baseDamage: 0, damageMultiplier: 1 },
  "vortex": { id: "vortex", name: "Vortex", element: "air", type: "container", role: "container", description: "Swirling air container", baseDamage: 0, damageMultiplier: 1 },
  
  // Propulsion (always available)
  "gust": { id: "gust", name: "Gust", element: "air", type: "action", role: "propulsion", description: "Propels objects forward", baseDamage: 0, damageMultiplier: 1 },
  
  // Air materials
  "lightning": { id: "lightning", name: "Lightning", element: "air", type: "material", role: "material", description: "Electrical discharge", baseDamage: 4, damageMultiplier: 1 },
  "storm": { id: "storm", name: "Storm", element: "air", type: "material", role: "material", description: "Violent tempest", baseDamage: 5, damageMultiplier: 1 },
  "breeze": { id: "breeze", name: "Breeze", element: "air", type: "material", role: "material", description: "Gentle wind", baseDamage: 1, damageMultiplier: 1 },
  "cyclone": { id: "cyclone", name: "Cyclone", element: "air", type: "material", role: "material", description: "Powerful rotating wind", baseDamage: 6, damageMultiplier: 1 },
  
  // Earth materials
  "boulder": { id: "boulder", name: "Boulder", element: "earth", type: "material", role: "material", description: "Massive rock", baseDamage: 5, damageMultiplier: 1 },
  "crystal": { id: "crystal", name: "Crystal", element: "earth", type: "material", role: "material", description: "Amplifies magical energy", baseDamage: 0, damageMultiplier: 2 },
  "sand": { id: "sand", name: "Sand", element: "earth", type: "material", role: "material", description: "Fine granular material", baseDamage: 1, damageMultiplier: 1.5 },
  "stone": { id: "stone", name: "Stone", element: "earth", type: "material", role: "material", description: "Dense rock fragment", baseDamage: 2, damageMultiplier: 1.5 },
  "sulfur": { id: "sulfur", name: "Sulfur", element: "earth", type: "material", role: "material", description: "Highly flammable mineral", baseDamage: 1, damageMultiplier: 2 },
  "pebble": { id: "pebble", name: "Pebble", element: "earth", type: "material", role: "material", description: "Small stone", baseDamage: 1, damageMultiplier: 1 },
  "quartz": { id: "quartz", name: "Quartz", element: "earth", type: "material", role: "material", description: "Clear crystalline mineral", baseDamage: 2, damageMultiplier: 1.5 },
  
  // Fire materials
  "ember": { id: "ember", name: "Ember", element: "fire", type: "material", role: "material", description: "Smoldering heat source", baseDamage: 2, damageMultiplier: 1 },
  "flame": { id: "flame", name: "Flame", element: "fire", type: "material", role: "material", description: "Pure elemental fire", baseDamage: 3, damageMultiplier: 1 },
  "magma": { id: "magma", name: "Magma", element: "fire", type: "material", role: "material", description: "Molten rock essence", baseDamage: 6, damageMultiplier: 1 },
  "spark": { id: "spark", name: "Spark", element: "fire", type: "material", role: "material", description: "Ignites flammable materials", baseDamage: 1, damageMultiplier: 1 },
  "inferno": { id: "inferno", name: "Inferno", element: "fire", type: "material", role: "material", description: "Raging flames", baseDamage: 7, damageMultiplier: 1 },
  "cinder": { id: "cinder", name: "Cinder", element: "fire", type: "material", role: "material", description: "Hot coal fragment", baseDamage: 2, damageMultiplier: 1 },
  
  // Water materials
  "frost": { id: "frost", name: "Frost", element: "water", type: "material", role: "material", description: "Freezes on contact", baseDamage: 2, damageMultiplier: 1 },
  "ice": { id: "ice", name: "Ice", element: "water", type: "material", role: "material", description: "Frozen crystalline structure", baseDamage: 2, damageMultiplier: 1.5 },
  "mist": { id: "mist", name: "Mist", element: "water", type: "material", role: "material", description: "Gentle water vapor", baseDamage: 1, damageMultiplier: 1 },
  "wave": { id: "wave", name: "Wave", element: "water", type: "material", role: "material", description: "Crashing water", baseDamage: 3, damageMultiplier: 1 },
  "glacier": { id: "glacier", name: "Glacier", element: "water", type: "material", role: "material", description: "Massive ice formation", baseDamage: 5, damageMultiplier: 1 },
  "droplet": { id: "droplet", name: "Droplet", element: "water", type: "material", role: "material", description: "Pure water drop", baseDamage: 1, damageMultiplier: 1 },
  "torrent": { id: "torrent", name: "Torrent", element: "water", type: "material", role: "material", description: "Rushing water", baseDamage: 4, damageMultiplier: 1 },
};

interface SpellCandidate {
  components: SpellComponent[];
  damage: number;
  shield: number;
  healing: number;
  materialsUsed: string[];
  score: number;
}

export function generateAISpell(
  hand: string[],
  specialization: Specialization,
  aiHealth: number,
  playerHealth: number,
  intellect: number
): SpellComponent[] {
  if (hand.length === 0) {
    return [];
  }

  // Determine strategy based on health
  const healthRatio = aiHealth / Math.max(playerHealth, 1);
  const needsHealing = healthRatio < 0.5 && aiHealth < 80;
  const needsShield = healthRatio < 0.7;

  // Generate all possible spell combinations from hand
  const candidates: SpellCandidate[] = [];

  // Try damage spells (1-4 materials)
  for (let size = 1; size <= Math.min(4, hand.length); size++) {
    const combos = getCombinations(hand, size);
    for (const combo of combos) {
      const damageSpell = buildDamageSpell(combo, specialization, intellect);
      if (damageSpell) {
        candidates.push(damageSpell);
      }
    }
  }

  // Try shield spells if we have the right materials
  const shieldMaterials = hand.filter(id => ["ice", "ember", "sand"].includes(id));
  for (const mat of shieldMaterials) {
    const shieldSpell = buildShieldSpell([mat], specialization);
    if (shieldSpell) {
      candidates.push(shieldSpell);
    }
  }

  // Try healing if we have all four elements in hand
  const healingSpell = tryBuildHealingSpell(hand, specialization);
  if (healingSpell) {
    candidates.push(healingSpell);
  }

  if (candidates.length === 0) {
    return [];
  }

  // Score and sort candidates
  scoreCandidates(candidates, needsHealing, needsShield, specialization);
  candidates.sort((a, b) => b.score - a.score);

  // Select best spell(s) up to MAX_SPELLS_PER_ROUND
  const selectedSpells: SpellCandidate[] = [];
  const usedMaterials = new Set<string>();

  for (const candidate of candidates) {
    if (selectedSpells.length >= MAX_SPELLS_PER_ROUND) break;
    
    // Check if this candidate uses any already-used materials
    const hasConflict = candidate.materialsUsed.some(id => usedMaterials.has(id));
    if (hasConflict) continue;

    selectedSpells.push(candidate);
    candidate.materialsUsed.forEach(id => usedMaterials.add(id));
  }

  // Combine all selected spells into one spell array
  const finalComponents: SpellComponent[] = [];
  for (const spell of selectedSpells) {
    finalComponents.push(...spell.components);
  }

  return assignUniqueIds(finalComponents);
}

function buildDamageSpell(
  materialIds: string[],
  specialization: Specialization,
  intellect: number
): SpellCandidate | null {
  const materials = materialIds
    .map(id => componentDefinitions[id])
    .filter(Boolean);

  if (materials.length === 0) return null;

  // Pick container - prefer air-sphere for simplicity
  const container = { ...componentDefinitions["air-sphere"] };
  const gust = { ...componentDefinitions["gust"] };

  container.children = [gust, ...materials];

  const components = [container];
  const stats = calculateSpellStats(components, specialization, intellect);

  if (!stats.hasValidPropulsion || stats.damage === 0) return null;

  return {
    components,
    damage: stats.damage,
    shield: 0,
    healing: 0,
    materialsUsed: materialIds,
    score: 0,
  };
}

function buildShieldSpell(
  materialIds: string[],
  specialization: Specialization
): SpellCandidate | null {
  const materials = materialIds
    .map(id => componentDefinitions[id])
    .filter(Boolean);

  if (materials.length === 0) return null;

  // Shield requires Vortex container
  const container = { ...componentDefinitions["vortex"] };
  container.children = [...materials];

  const components = [container];
  const stats = calculateSpellStats(components, specialization);

  if (stats.shieldPower === 0) return null;

  return {
    components,
    damage: 0,
    shield: stats.shieldPower,
    healing: 0,
    materialsUsed: materialIds,
    score: 0,
  };
}

function tryBuildHealingSpell(
  hand: string[],
  specialization: Specialization
): SpellCandidate | null {
  // Healing requires: Vortex + mist + crystal + ember + air element
  const hasMist = hand.includes("mist");
  const hasCrystal = hand.includes("crystal");
  const hasEmber = hand.includes("ember");
  const airMaterials = hand.filter(id => {
    const comp = componentDefinitions[id];
    return comp && comp.element === "air";
  });

  if (!hasMist || !hasCrystal || !hasEmber || airMaterials.length === 0) {
    return null;
  }

  const container = { ...componentDefinitions["vortex"] };
  const children = [
    { ...componentDefinitions["mist"] },
    { ...componentDefinitions["crystal"] },
    { ...componentDefinitions["ember"] },
    { ...componentDefinitions[airMaterials[0]] },
  ];
  container.children = children;

  const components = [container];
  const stats = calculateSpellStats(components, specialization);

  if (stats.healingPower === 0) return null;

  return {
    components,
    damage: 0,
    shield: 0,
    healing: stats.healingPower,
    materialsUsed: ["mist", "crystal", "ember", airMaterials[0]],
    score: 0,
  };
}

function scoreCandidates(
  candidates: SpellCandidate[],
  needsHealing: boolean,
  needsShield: boolean,
  specialization: Specialization
): void {
  for (const candidate of candidates) {
    let score = 0;

    // Base score from effects
    score += candidate.damage * 2;
    score += candidate.shield * 1.5;
    score += candidate.healing * (needsHealing ? 3 : 1);

    // Bonus for shields when health is low
    if (needsShield && candidate.shield > 0) {
      score += 10;
    }

    // Bonus for healing when critically needed
    if (needsHealing && candidate.healing > 0) {
      score += 15;
    }

    // Specialization bonus
    const hasSpecElement = candidate.components.some(c => {
      if (specialization === "pyromancer") {
        return c.element === "fire" || c.children?.some(ch => ch.element === "fire");
      } else {
        return c.element === "water" || c.children?.some(ch => ch.element === "water");
      }
    });
    if (hasSpecElement) {
      score *= 1.2;
    }

    // Efficiency bonus (more effect with fewer materials)
    if (candidate.materialsUsed.length > 0) {
      const efficiency = (candidate.damage + candidate.shield + candidate.healing) / candidate.materialsUsed.length;
      score += efficiency * 0.5;
    }

    candidate.score = score;
  }
}

function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (array.length === 0) return [];
  if (size > array.length) return [];

  const [first, ...rest] = array;
  const withFirst = getCombinations(rest, size - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, size);

  return [...withFirst, ...withoutFirst];
}

function assignUniqueIds(components: SpellComponent[]): SpellComponent[] {
  return components.map(comp => ({
    ...comp,
    baseId: comp.baseId || comp.id,
    id: `${comp.id}-${randomUUID()}`,
    children: comp.children ? assignUniqueIds(comp.children) : undefined,
  }));
}

export function getAIDifficulty(opponentHealth: number, playerHealth: number): number {
  if (opponentHealth < playerHealth * 0.5) {
    return 1.0;
  } else if (opponentHealth < playerHealth * 0.75) {
    return 0.95;
  }
  return 0.9;
}
