import { GameState, SpellComponent, Specialization } from "@shared/schema";

export interface CharacterData {
  name: string;
  intellect: number;
  stamina: number;
  wisdom: number;
  specialization: Specialization;
}

export interface CastSpellResponse {
  gameState: GameState;
  playerSpellResult: {
    effect: string;
    damage: number;
    damageDealt?: number;
    damageBlocked?: number;
    shieldPower?: number;
    healingPower?: number;
    componentsUsed?: number;
    target: "self" | "opponent";
  };
  aiSpellResult?: {
    effect: string;
    damage: number;
    damageDealt?: number;
    damageBlocked?: number;
    shieldPower?: number;
    healingPower?: number;
    componentsUsed?: number;
    target: "self" | "opponent";
    components: SpellComponent[];
  } | null;
}

export async function createNewGame(characterData: CharacterData): Promise<{ sessionId: string; gameState: GameState }> {
  const response = await fetch("/api/game/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characterData }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create game");
  }
  
  return response.json();
}

export async function getGameState(sessionId: string): Promise<GameState> {
  const response = await fetch(`/api/game/${sessionId}`);
  
  if (!response.ok) {
    throw new Error("Failed to get game state");
  }
  
  return response.json();
}

export async function castSpell(sessionId: string, components: SpellComponent[]): Promise<CastSpellResponse> {
  const response = await fetch(`/api/game/${sessionId}/cast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ components }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cast spell");
  }
  
  return response.json();
}

export async function advanceToNextRound(sessionId: string): Promise<{ gameState: GameState }> {
  const response = await fetch(`/api/game/${sessionId}/next-round`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!response.ok) {
    throw new Error("Failed to advance to next round");
  }
  
  return response.json();
}

export async function deleteGame(sessionId: string): Promise<void> {
  const response = await fetch(`/api/game/${sessionId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete game");
  }
}
