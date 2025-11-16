import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  createInitialGameState, 
  calculateSpellStats, 
  validateSpell, 
  applyCombatDamage,
  consumeMana,
  switchTurn,
  CharacterAttributes
} from "./gameLogic";
import { generateAISpell, getAIDifficulty } from "./aiLogic";
import { SpellComponent, GameState } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize a new game
  app.post("/api/game/new", async (req, res) => {
    try {
      const { characterData } = req.body as { characterData: CharacterAttributes };
      
      if (!characterData) {
        return res.status(400).json({ error: "Character data is required" });
      }
      
      // Validate name is a non-empty string
      if (typeof characterData.name !== "string" || !characterData.name.trim()) {
        return res.status(400).json({ error: "Name must be a non-empty string" });
      }
      
      // Validate specialization is one of the allowed values
      const validSpecializations = ["pyromancer", "aquamancer"];
      if (!validSpecializations.includes(characterData.specialization)) {
        return res.status(400).json({ error: "Specialization must be either 'pyromancer' or 'aquamancer'" });
      }
      
      // Validate attribute bounds and point budget
      const { intellect, stamina, wisdom } = characterData;
      const MIN_ATTRIBUTE = 6;
      const BASE_ATTRIBUTE = 10;
      const FREE_POINTS = 6;
      const MAX_ATTRIBUTE = BASE_ATTRIBUTE + FREE_POINTS; // 16 max per attribute
      const MAX_TOTAL_ATTRIBUTES = (3 * BASE_ATTRIBUTE) + FREE_POINTS; // 36 total points
      
      // Ensure all attributes are valid finite numbers
      if (!Number.isFinite(intellect) || !Number.isFinite(stamina) || !Number.isFinite(wisdom)) {
        return res.status(400).json({ error: "All attributes must be valid numbers" });
      }
      
      // Ensure all attributes are integers
      if (!Number.isInteger(intellect) || !Number.isInteger(stamina) || !Number.isInteger(wisdom)) {
        return res.status(400).json({ error: "All attributes must be integers" });
      }
      
      // Check minimum and maximum bounds per attribute
      if (intellect < MIN_ATTRIBUTE || stamina < MIN_ATTRIBUTE || wisdom < MIN_ATTRIBUTE) {
        return res.status(400).json({ error: "Attributes cannot be below minimum value" });
      }
      
      if (intellect > MAX_ATTRIBUTE || stamina > MAX_ATTRIBUTE || wisdom > MAX_ATTRIBUTE) {
        return res.status(400).json({ error: "Attributes cannot exceed maximum value" });
      }
      
      // Validate total attribute sum (prevents redistribution exploits)
      const totalAttributes = intellect + stamina + wisdom;
      if (!Number.isFinite(totalAttributes)) {
        return res.status(400).json({ error: "Invalid attribute sum" });
      }
      
      if (totalAttributes > MAX_TOTAL_ATTRIBUTES) {
        return res.status(400).json({ error: "Total attributes exceed maximum allowed" });
      }
      
      const sessionId = randomUUID();
      const gameState = createInitialGameState(characterData);
      
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
      const validation = validateSpell(components, gameState.player.mana, gameState.player.specialization);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      // Calculate spell effects
      const { damage, manaCost, effect, target } = calculateSpellStats(components, gameState.player.specialization);
      
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
      const { damage, manaCost, effect, target } = calculateSpellStats(aiComponents, gameState.opponent.specialization);
      
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
