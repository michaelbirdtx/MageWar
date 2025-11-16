import { type User, type InsertUser, type GameState, type Spell } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGameState(sessionId: string): Promise<GameState | undefined>;
  updateGameState(sessionId: string, state: GameState): Promise<void>;
  deleteGameState(sessionId: string): Promise<void>;
  
  saveSpell(spell: Spell): Promise<Spell>;
  getSpells(sessionId: string): Promise<Spell[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameStates: Map<string, GameState>;
  private spells: Map<string, Spell[]>;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
    this.spells = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getGameState(sessionId: string): Promise<GameState | undefined> {
    return this.gameStates.get(sessionId);
  }
  
  async updateGameState(sessionId: string, state: GameState): Promise<void> {
    this.gameStates.set(sessionId, state);
  }
  
  async deleteGameState(sessionId: string): Promise<void> {
    this.gameStates.delete(sessionId);
    this.spells.delete(sessionId);
  }
  
  async saveSpell(spell: Spell): Promise<Spell> {
    const sessionSpells = this.spells.get(spell.id) || [];
    sessionSpells.push(spell);
    this.spells.set(spell.id, sessionSpells);
    return spell;
  }
  
  async getSpells(sessionId: string): Promise<Spell[]> {
    return this.spells.get(sessionId) || [];
  }
}

export const storage = new MemStorage();
