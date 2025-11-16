import { SpellComponent, Spell } from "@shared/schema";
import { randomUUID } from "crypto";
import { calculateSpellStats } from "./gameLogic";

const availableComponents: SpellComponent[] = [
  // Fire
  { id: "spark", name: "Spark", element: "fire", type: "action", description: "Ignites", manaCost: 5 },
  { id: "flame", name: "Flame", element: "fire", type: "material", description: "Pure fire", manaCost: 10 },
  { id: "sulfur", name: "Sulfur", element: "earth", type: "material", description: "Flammable", manaCost: 8 },
  { id: "ember", name: "Ember", element: "fire", type: "material", description: "Heat", manaCost: 6 },
  
  // Water
  { id: "ice", name: "Ice", element: "water", type: "material", description: "Frozen", manaCost: 8 },
  { id: "water", name: "Water", element: "water", type: "material", description: "Liquid", manaCost: 7 },
  { id: "frost", name: "Frost", element: "water", type: "action", description: "Freezes", manaCost: 9 },
  { id: "mist", name: "Mist", element: "water", type: "material", description: "Vapor", manaCost: 5 },
  
  // Earth
  { id: "stone", name: "Stone", element: "earth", type: "material", description: "Dense", manaCost: 6 },
  { id: "sand", name: "Sand", element: "earth", type: "material", description: "Granular", manaCost: 4 },
  { id: "crystal", name: "Crystal", element: "earth", type: "material", description: "Amplifies", manaCost: 12 },
  
  // Air
  { id: "air-sphere", name: "Air Sphere", element: "air", type: "container", description: "Container", manaCost: 10 },
  { id: "gust", name: "Gust", element: "air", type: "action", description: "Propels", manaCost: 8 },
  { id: "wind", name: "Wind", element: "air", type: "material", description: "Current", manaCost: 6 },
  { id: "vortex", name: "Vortex", element: "air", type: "container", description: "Swirling", manaCost: 12 },
];

interface SpellStrategy {
  name: string;
  components: SpellComponent[];
  priority: number;
}

const spellStrategies: SpellStrategy[] = [
  {
    name: "Fireball",
    priority: 10,
    components: [
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "sulfur")!,
        availableComponents.find(c => c.id === "spark")!,
      ]},
      availableComponents.find(c => c.id === "gust")!,
    ],
  },
  {
    name: "Frost Bolt",
    priority: 9,
    components: [
      { ...availableComponents.find(c => c.id === "air-sphere")!, children: [
        availableComponents.find(c => c.id === "ice")!,
      ]},
      availableComponents.find(c => c.id === "frost")!,
      availableComponents.find(c => c.id === "gust")!,
    ],
  },
  {
    name: "Steam Blast",
    priority: 8,
    components: [
      availableComponents.find(c => c.id === "flame")!,
      availableComponents.find(c => c.id === "water")!,
      availableComponents.find(c => c.id === "gust")!,
    ],
  },
  {
    name: "Basic Fire",
    priority: 5,
    components: [
      availableComponents.find(c => c.id === "flame")!,
      availableComponents.find(c => c.id === "ember")!,
    ],
  },
  {
    name: "Simple Ice",
    priority: 5,
    components: [
      availableComponents.find(c => c.id === "ice")!,
      availableComponents.find(c => c.id === "frost")!,
    ],
  },
  {
    name: "Quick Spark",
    priority: 3,
    components: [
      availableComponents.find(c => c.id === "spark")!,
      availableComponents.find(c => c.id === "wind")!,
    ],
  },
];

export function generateAISpell(availableMana: number, difficulty: number = 0.7): SpellComponent[] {
  // Sort strategies by priority
  const sortedStrategies = [...spellStrategies].sort((a, b) => b.priority - a.priority);
  
  // Try to use the best spell we can afford
  for (const strategy of sortedStrategies) {
    const components = deepCloneComponents(strategy.components);
    const { manaCost } = calculateSpellStats(components);
    
    if (manaCost <= availableMana) {
      // Add some randomness based on difficulty
      if (Math.random() < difficulty) {
        return assignUniqueIds(components);
      }
    }
  }
  
  // If we can't afford any strategy, build a simple spell
  const simpleComponents: SpellComponent[] = [];
  let totalCost = 0;
  
  const shuffled = [...availableComponents].sort(() => Math.random() - 0.5);
  
  for (const comp of shuffled) {
    if (totalCost + comp.manaCost <= availableMana && simpleComponents.length < 3) {
      simpleComponents.push({ ...comp });
      totalCost += comp.manaCost;
    }
  }
  
  return assignUniqueIds(simpleComponents);
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
  // AI gets more aggressive when losing
  if (opponentHealth < playerHealth * 0.5) {
    return 0.9;
  } else if (opponentHealth < playerHealth * 0.75) {
    return 0.8;
  }
  return 0.7;
}
