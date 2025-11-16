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

export interface SpellComponent {
  id: string;
  name: string;
  element: ElementType;
  type: "container" | "material" | "action";
  role: ComponentRole;
  description: string;
  manaCost: number;
  baseDamage: number;
  damageMultiplier: number;
  children?: SpellComponent[];
}

export interface Spell {
  id: string;
  name: string;
  components: SpellComponent[];
  totalManaCost: number;
  damage: number;
  effect?: string;
}

export interface Mage {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  isPlayer: boolean;
}

export interface GameState {
  player: Mage;
  opponent: Mage;
  currentTurn: "player" | "opponent";
  gamePhase: "building" | "combat" | "victory" | "defeat";
}
