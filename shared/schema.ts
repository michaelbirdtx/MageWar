import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type ElementType = "fire" | "water" | "earth" | "air";
export type ComponentRole = "activation" | "propulsion" | "container" | "material";
export type Specialization = "pyromancer" | "aquamancer";
export type EffectType = "damage" | "shield" | "healing";

// Game Configuration Constants
export const MAX_SPELLS_PER_ROUND = 2; // Maximum number of containers (spells) per round

export interface SpellComponent {
  id: string;
  baseId?: string; // Original component ID before cloning (for pattern matching)
  name: string;
  element: ElementType;
  type: "container" | "material" | "action";
  role: ComponentRole;
  description: string;
  baseDamage: number;
  damageMultiplier: number;
  effectType?: EffectType;
  shieldPower?: number;
  healingPower?: number;
  children?: SpellComponent[];
  rarity?: "common" | "uncommon" | "rare"; // For weighted draw system
}

export interface Spell {
  id: string;
  name: string;
  components: SpellComponent[];
  damage: number;
  shieldPower: number;
  healingPower: number;
  effect?: string;
}

export interface Mage {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  intellect: number; // Now adds bonus damage to spells
  stamina: number;
  wisdom: number; // Determines starting hand size (wisdom / 2, rounded up)
  specialization: Specialization;
  isPlayer: boolean;
  hand: string[]; // Component IDs available to use this round
}

export interface GameState {
  player: Mage;
  opponent: Mage;
  currentTurn: "player" | "opponent";
  gamePhase: "building" | "combat" | "victory" | "defeat" | "tie";
  playerSpellLocked: boolean;
  aiSpellLocked: boolean;
  lockedPlayerSpell: Spell | null;
  lockedAiSpell: Spell | null;
  componentPool: string[]; // All drawable component IDs (shuffled bag)
  discardPile: string[]; // Used components that can be reshuffled when pool is depleted
  round: number;
}
