import { SpellComponent, Spell } from "@shared/schema";
import { randomUUID } from "crypto";
import { calculateSpellStats } from "./gameLogic";

const availableComponents: SpellComponent[] = [
  // Fire
  { id: "spark", name: "Spark", element: "fire", type: "action", role: "activation", description: "Ignites", manaCost: 5, baseDamage: 1, damageMultiplier: 1 },
  { id: "flame", name: "Flame", element: "fire", type: "material", role: "activation", description: "Pure fire", manaCost: 10, baseDamage: 3, damageMultiplier: 1 },
  { id: "sulfur", name: "Sulfur", element: "earth", type: "material", role: "material", description: "Flammable", manaCost: 8, baseDamage: 0, damageMultiplier: 4 },
  { id: "ember", name: "Ember", element: "fire", type: "material", role: "activation", description: "Heat", manaCost: 6, baseDamage: 2, damageMultiplier: 1 },
  
  // Water
  { id: "ice", name: "Ice", element: "water", type: "material", role: "material", description: "Frozen", manaCost: 8, baseDamage: 0, damageMultiplier: 3 },
  { id: "water", name: "Water", element: "water", type: "material", role: "material", description: "Liquid", manaCost: 7, baseDamage: 0, damageMultiplier: 2 },
  { id: "frost", name: "Frost", element: "water", type: "action", role: "activation", description: "Freezes", manaCost: 9, baseDamage: 2, damageMultiplier: 1 },
  { id: "mist", name: "Mist", element: "water", type: "material", role: "material", description: "Vapor", manaCost: 5, baseDamage: 0, damageMultiplier: 2 },
  
  // Earth
  { id: "stone", name: "Stone", element: "earth", type: "material", role: "material", description: "Dense", manaCost: 6, baseDamage: 0, damageMultiplier: 3 },
  { id: "sand", name: "Sand", element: "earth", type: "material", role: "material", description: "Granular", manaCost: 4, baseDamage: 0, damageMultiplier: 2 },
  { id: "crystal", name: "Crystal", element: "earth", type: "material", role: "material", description: "Amplifies", manaCost: 12, baseDamage: 0, damageMultiplier: 5 },
  
  // Air
  { id: "air-sphere", name: "Air Sphere", element: "air", type: "container", role: "container", description: "Container", manaCost: 10, baseDamage: 0, damageMultiplier: 1 },
  { id: "gust", name: "Gust", element: "air", type: "action", role: "propulsion", description: "Propels", manaCost: 8, baseDamage: 0, damageMultiplier: 1 },
  { id: "wind", name: "Wind", element: "air", type: "material", role: "propulsion", description: "Current", manaCost: 6, baseDamage: 0, damageMultiplier: 1 },
  { id: "vortex", name: "Vortex", element: "air", type: "container", role: "container", description: "Swirling", manaCost: 12, baseDamage: 0, damageMultiplier: 1 },
];

interface SpellStrategy {
  name: string;
  components: SpellComponent[];
  priority: number;
}

const spellStrategies: SpellStrategy[] = [
  // Devastating Crystal-based spells (highest priority)
  {
    name: "Crystal Inferno",
    priority: 16,
    components: [
      availableComponents.find(c => c.id === "flame")!,
      { ...availableComponents.find(c => c.id === "vortex")!, children: [
        availableComponents.find(c => c.id === "crystal")!,
        availableComponents.find(c => c.id === "sulfur")!,
        availableComponents.find(c => c.id === "gust")!,
      ]},
    ],
  },
  {
    name: "Crystal Frost",
    priority: 15,
    components: [
      availableComponents.find(c => c.id === "frost")!,
      { ...availableComponents.find(c => c.id === "vortex")!, children: [
        availableComponents.find(c => c.id === "crystal")!,
        availableComponents.find(c => c.id === "ice")!,
        availableComponents.find(c => c.id === "gust")!,
      ]},
    ],
  },
  {
    name: "Volcanic Blast",
    priority: 14,
    components: [
      availableComponents.find(c => c.id === "flame")!,
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "sulfur")!,
        availableComponents.find(c => c.id === "stone")!,
        availableComponents.find(c => c.id === "gust")!,
      ]},
    ],
  },
  {
    name: "Glacial Strike",
    priority: 13,
    components: [
      availableComponents.find(c => c.id === "frost")!,
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "ice")!,
        availableComponents.find(c => c.id === "stone")!,
        availableComponents.find(c => c.id === "wind")!,
      ]},
    ],
  },
  {
    name: "Inferno Wave",
    priority: 12,
    components: [
      availableComponents.find(c => c.id === "spark")!,
      { ...availableComponents.find(c => c.id === "vortex")!, children: [
        availableComponents.find(c => c.id === "sulfur")!,
        availableComponents.find(c => c.id === "sand")!,
        availableComponents.find(c => c.id === "gust")!,
      ]},
    ],
  },
  {
    name: "Arctic Missile",
    priority: 11,
    components: [
      availableComponents.find(c => c.id === "frost")!,
      { ...availableComponents.find(c => c.id === "vortex")!, children: [
        availableComponents.find(c => c.id === "ice")!,
        availableComponents.find(c => c.id === "water")!,
        availableComponents.find(c => c.id === "wind")!,
      ]},
    ],
  },
  // Original strategies (lower priority)
  {
    name: "Fireball",
    priority: 10,
    components: [
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "sulfur")!,
        availableComponents.find(c => c.id === "spark")!,
        availableComponents.find(c => c.id === "gust")!,
      ]},
    ],
  },
  {
    name: "Frost Bolt",
    priority: 9,
    components: [
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "ice")!,
        availableComponents.find(c => c.id === "frost")!,
        availableComponents.find(c => c.id === "wind")!,
      ]},
    ],
  },
  {
    name: "Fire Strike",
    priority: 8,
    components: [
      { ...availableComponents.find(c => c.id === "vortex")!, children: [
        availableComponents.find(c => c.id === "flame")!,
        availableComponents.find(c => c.id === "gust")!,
      ]},
    ],
  },
  {
    name: "Ice Blast",
    priority: 7,
    components: [
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "ice")!,
        availableComponents.find(c => c.id === "water")!,
        availableComponents.find(c => c.id === "wind")!,
      ]},
    ],
  },
  {
    name: "Ember Strike",
    priority: 6,
    components: [
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "ember")!,
        availableComponents.find(c => c.id === "sand")!,
        availableComponents.find(c => c.id === "gust")!,
      ]},
    ],
  },
  {
    name: "Basic Missile",
    priority: 5,
    components: [
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "stone")!,
        availableComponents.find(c => c.id === "wind")!,
      ]},
    ],
  },
];

export function generateAISpell(
  availableMana: number, 
  difficulty: number = 0.9,
  specialization?: "pyromancer" | "aquamancer"
): SpellComponent[] {
  // Sort strategies by priority, boosting priority for specialization-matching spells
  const sortedStrategies = [...spellStrategies].map(strategy => {
    let adjustedPriority = strategy.priority;
    
    // Boost priority for spells matching AI specialization
    if (specialization === "pyromancer") {
      // Prioritize fire spells (Crystal Inferno, Volcanic Blast, Inferno Wave, Fireball, Fire Strike)
      if (["Crystal Inferno", "Volcanic Blast", "Inferno Wave", "Fireball", "Fire Strike", "Ember Strike"].includes(strategy.name)) {
        adjustedPriority += 3;
      }
    } else if (specialization === "aquamancer") {
      // Prioritize water/ice spells (Crystal Frost, Glacial Strike, Arctic Missile, Frost Bolt, Ice Blast)
      if (["Crystal Frost", "Glacial Strike", "Arctic Missile", "Frost Bolt", "Ice Blast"].includes(strategy.name)) {
        adjustedPriority += 3;
      }
    }
    
    return { ...strategy, priority: adjustedPriority };
  }).sort((a, b) => b.priority - a.priority);
  
  // Try to use the best spell we can afford
  for (const strategy of sortedStrategies) {
    const components = deepCloneComponents(strategy.components);
    const stats = calculateSpellStats(components, specialization);
    
    // Ensure spell costs within budget AND targets opponent
    if (stats.manaCost <= availableMana && stats.target === "opponent") {
      // Add some randomness based on difficulty
      if (Math.random() < difficulty) {
        return assignUniqueIds(components);
      }
    }
  }
  
  // If we can't afford any strategy or none passed validation, return empty array (AI passes)
  // We don't want AI to build random simple spells that might damage itself
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
