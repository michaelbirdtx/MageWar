import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  createInitialGameState, 
  calculateSpellStats, 
  validateSpell, 
  applyCombatDamage,
  consumeMana,
  switchTurn
} from "./gameLogic";
import { generateAISpell, getAIDifficulty } from "./aiLogic";
import { SpellComponent, GameState } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize a new game
  app.post("/api/game/new", async (req, res) => {
    try {
      const sessionId = randomUUID();
      const gameState = createInitialGameState();
      
      await storage.updateGameState(sessionId, gameState);
      
      res.json({ sessionId, gameState });
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ error: "Failed to create game" });
    }
  });
  
  // Get current game state
  app.get("/api/game/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const gameState = await storage.getGameState(sessionId);
      
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      res.json(gameState);
    } catch (error) {
      console.error("Error getting game state:", error);
      res.status(500).json({ error: "Failed to get game state" });
    }
  });
  
  // Cast a spell
  app.post("/api/game/:sessionId/cast", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { components } = req.body as { components: SpellComponent[] };
      
      let gameState = await storage.getGameState(sessionId);
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      if (gameState.currentTurn !== "player") {
        return res.status(400).json({ error: "Not player's turn" });
      }
      
      if (gameState.gamePhase !== "building" && gameState.gamePhase !== "combat") {
        return res.status(400).json({ error: "Game is over" });
      }
      
      // Validate spell
      const validation = validateSpell(components, gameState.player.mana);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      // Calculate spell effects
      const { damage, manaCost, effect, target } = calculateSpellStats(components);
      
      // Apply damage and mana cost
      gameState.player = consumeMana(gameState.player, manaCost);
      gameState = applyCombatDamage(gameState, damage, target === "opponent" ? "opponent" : "player");
      gameState.gamePhase = "combat";
      
      await storage.updateGameState(sessionId, gameState);
      
      // Return the spell result
      res.json({
        gameState,
        spellResult: { effect, damage, manaCost, target },
      });
    } catch (error) {
      console.error("Error casting spell:", error);
      res.status(500).json({ error: "Failed to cast spell" });
    }
  });
  
  // AI turn
  app.post("/api/game/:sessionId/ai-turn", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      let gameState = await storage.getGameState(sessionId);
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      if (gameState.gamePhase === "victory" || gameState.gamePhase === "defeat") {
        return res.status(400).json({ error: "Game is over" });
      }
      
      // Switch to AI turn
      gameState = switchTurn(gameState);
      
      // Generate AI spell based on difficulty
      const difficulty = getAIDifficulty(gameState.opponent.health, gameState.player.health);
      const aiComponents = generateAISpell(gameState.opponent.mana, difficulty);
      
      if (aiComponents.length === 0) {
        // AI passes turn if can't cast
        gameState = switchTurn(gameState);
        await storage.updateGameState(sessionId, gameState);
        return res.json({ gameState, aiPassed: true });
      }
      
      // Calculate AI spell effects
      const { damage, manaCost, effect, target } = calculateSpellStats(aiComponents);
      
      // Apply AI spell (AI should always target player, but check just in case)
      gameState.opponent = consumeMana(gameState.opponent, manaCost);
      gameState = applyCombatDamage(gameState, damage, target === "opponent" ? "player" : "opponent");
      
      // Switch back to player turn
      gameState = switchTurn(gameState);
      
      await storage.updateGameState(sessionId, gameState);
      
      res.json({
        gameState,
        aiSpell: { effect, damage, manaCost, target, components: aiComponents },
      });
    } catch (error) {
      console.error("Error in AI turn:", error);
      res.status(500).json({ error: "Failed to execute AI turn" });
    }
  });
  
  // Reset/delete game
  app.delete("/api/game/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteGameState(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ error: "Failed to delete game" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
