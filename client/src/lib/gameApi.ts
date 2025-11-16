import { GameState, SpellComponent } from "@shared/schema";

export interface CastSpellResponse {
  gameState: GameState;
  spellResult: {
    effect: string;
    damage: number;
    manaCost: number;
    target: "self" | "opponent";
  };
}

export interface AITurnResponse {
  gameState: GameState;
  aiSpell?: {
    effect: string;
    damage: number;
    manaCost: number;
    target: "self" | "opponent";
    components: SpellComponent[];
  };
  aiPassed?: boolean;
}

export async function createNewGame(): Promise<{ sessionId: string; gameState: GameState }> {
  const response = await fetch("/api/game/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export async function executeAITurn(sessionId: string): Promise<AITurnResponse> {
  const response = await fetch(`/api/game/${sessionId}/ai-turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!response.ok) {
    throw new Error("Failed to execute AI turn");
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
