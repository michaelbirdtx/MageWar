import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  createInitialGameState, 
  calculateSpellStats, 
  validateSpell, 
  applyCombatDamage,
  applySimultaneousDamage,
  applyCombatResolution,
  checkGameEnd,
  replenishHand,
  removeUsedFromHand,
  nextRound,
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
      
      // Enforce that all points must be spent
      if (totalAttributes !== MAX_TOTAL_ATTRIBUTES) {
        return res.status(400).json({ error: "All attribute points must be assigned" });
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
  
  // Cast a spell (now with simultaneous reveal)
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
      
      // Validate player spell against their hand
      const validation = validateSpell(components, gameState.player.hand || []);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
      
      // Calculate player spell effects (include intellect for damage bonus)
      const playerStats = calculateSpellStats(components, gameState.player.specialization, gameState.player.intellect);
      
      // Collect materials used by player
      const playerMaterialsUsed: string[] = [];
      const collectMaterials = (comps: SpellComponent[]) => {
        for (const comp of comps) {
          if (comp.role !== "container" && comp.role !== "propulsion") {
            playerMaterialsUsed.push(comp.baseId || comp.id);
          }
          if (comp.children) collectMaterials(comp.children);
        }
      };
      collectMaterials(components);
      
      // Lock in player spell
      gameState.playerSpellLocked = true;
      gameState.lockedPlayerSpell = {
        id: `player-spell-${Date.now()}`,
        name: playerStats.effect,
        components,
        damage: playerStats.damage,
        shieldPower: playerStats.shieldPower,
        healingPower: playerStats.healingPower,
        effect: playerStats.effect,
      };
      
      // Generate AI spell from its hand
      const aiComponents = generateAISpell(
        gameState.opponent.hand || [],
        gameState.opponent.specialization,
        gameState.opponent.health,
        gameState.player.health,
        gameState.opponent.intellect
      );
      
      let aiStats;
      let aiMaterialsUsed: string[] = [];
      if (aiComponents.length > 0) {
        // Calculate AI spell effects
        aiStats = calculateSpellStats(aiComponents, gameState.opponent.specialization, gameState.opponent.intellect);
        
        // Collect materials used by AI
        const collectAIMaterials = (comps: SpellComponent[]) => {
          for (const comp of comps) {
            if (comp.role !== "container" && comp.role !== "propulsion") {
              aiMaterialsUsed.push(comp.baseId || comp.id);
            }
            if (comp.children) collectAIMaterials(comp.children);
          }
        };
        collectAIMaterials(aiComponents);
        
        // Lock in AI spell
        gameState.aiSpellLocked = true;
        gameState.lockedAiSpell = {
          id: `ai-spell-${Date.now()}`,
          name: aiStats.effect,
          components: aiComponents,
          damage: aiStats.damage,
          shieldPower: aiStats.shieldPower,
          healingPower: aiStats.healingPower,
          effect: aiStats.effect,
        };
      }
      
      // Remove used materials from hands
      gameState.player = removeUsedFromHand(gameState.player, playerMaterialsUsed);
      if (aiComponents.length > 0) {
        gameState.opponent = removeUsedFromHand(gameState.opponent, aiMaterialsUsed);
      }
      
      // Track actual damage dealt after shields for results display
      let playerDamageDealt = 0;
      let playerDamageBlocked = 0;
      let aiDamageDealt = 0;
      let aiDamageBlocked = 0;
      
      // Apply combat with universal targeting
      if (aiComponents.length > 0 && aiStats) {
        const playerToOpponent = playerStats.target === "opponent";
        const aiToOpponent = aiStats.target === "opponent";
        
        let damageToPlayer = 0;
        let damageToAI = 0;
        let shieldOnPlayer = 0;
        let shieldOnAI = 0;
        let healingOnPlayer = 0;
        let healingOnAI = 0;
        
        // Route player's spell effects
        if (playerToOpponent) {
          damageToAI += playerStats.damage;
          shieldOnAI += playerStats.shieldPower;
          healingOnAI += playerStats.healingPower;
        } else {
          damageToPlayer += playerStats.damage;
          shieldOnPlayer += playerStats.shieldPower;
          healingOnPlayer += playerStats.healingPower;
        }
        
        // Route AI's spell effects
        if (aiToOpponent) {
          damageToPlayer += aiStats.damage;
          shieldOnPlayer += aiStats.shieldPower;
          healingOnPlayer += aiStats.healingPower;
        } else {
          damageToAI += aiStats.damage;
          shieldOnAI += aiStats.shieldPower;
          healingOnAI += aiStats.healingPower;
        }
        
        // Apply shields to reduce damage
        const finalDamageToPlayer = Math.max(0, damageToPlayer - shieldOnPlayer);
        const finalDamageToAI = Math.max(0, damageToAI - shieldOnAI);
        
        // Track damage dealt and blocked for display
        if (playerToOpponent) {
          playerDamageDealt = Math.max(0, playerStats.damage - shieldOnAI);
          playerDamageBlocked = Math.min(playerStats.damage, shieldOnAI);
        }
        if (aiToOpponent) {
          aiDamageDealt = Math.max(0, aiStats.damage - shieldOnPlayer);
          aiDamageBlocked = Math.min(aiStats.damage, shieldOnPlayer);
        }
        
        // Apply damage simultaneously
        gameState = applySimultaneousDamage(gameState, finalDamageToPlayer, finalDamageToAI);
        
        // Apply healing
        gameState.player = {
          ...gameState.player,
          health: Math.min(gameState.player.maxHealth, gameState.player.health + healingOnPlayer),
        };
        gameState.opponent = {
          ...gameState.opponent,
          health: Math.min(gameState.opponent.maxHealth, gameState.opponent.health + healingOnAI),
        };
      } else {
        // Player only (no AI spell)
        const playerToOpponent = playerStats.target === "opponent";
        
        if (playerToOpponent) {
          const finalDamage = Math.max(0, playerStats.damage - 0);
          playerDamageDealt = finalDamage;
          playerDamageBlocked = 0;
          gameState = applySimultaneousDamage(gameState, 0, finalDamage);
          gameState.opponent = {
            ...gameState.opponent,
            health: Math.min(gameState.opponent.maxHealth, gameState.opponent.health + playerStats.healingPower),
          };
        } else {
          const finalDamage = Math.max(0, playerStats.damage - playerStats.shieldPower);
          gameState = applySimultaneousDamage(gameState, finalDamage, 0);
          gameState.player = {
            ...gameState.player,
            health: Math.min(gameState.player.maxHealth, gameState.player.health + playerStats.healingPower),
          };
        }
      }
      
      // Check for victory/defeat/tie after all damage is applied
      gameState = checkGameEnd(gameState);
      
      // If game is still ongoing, set to combat phase
      if (gameState.gamePhase !== "victory" && gameState.gamePhase !== "defeat" && gameState.gamePhase !== "tie") {
        gameState.gamePhase = "combat";
        
        // Replenish hands with new components equal to what was used
        gameState = replenishHand(gameState, "player", playerMaterialsUsed.length);
        gameState = replenishHand(gameState, "opponent", aiMaterialsUsed.length);
      }
      
      await storage.updateGameState(sessionId, gameState);
      
      // Return both spell results for simultaneous reveal
      res.json({
        gameState,
        playerSpellResult: { 
          effect: playerStats.effect, 
          damage: playerStats.damage,
          damageDealt: playerDamageDealt,
          damageBlocked: playerDamageBlocked,
          shieldPower: playerStats.shieldPower,
          healingPower: playerStats.healingPower,
          componentsUsed: playerStats.componentsUsed,
          target: playerStats.target,
        },
        aiSpellResult: aiComponents.length > 0 && aiStats ? {
          effect: aiStats.effect,
          damage: aiStats.damage,
          damageDealt: aiDamageDealt,
          damageBlocked: aiDamageBlocked,
          shieldPower: aiStats.shieldPower,
          healingPower: aiStats.healingPower,
          componentsUsed: aiStats.componentsUsed,
          target: aiStats.target,
          components: aiComponents,
        } : null,
      });
    } catch (error) {
      console.error("Error casting spell:", error);
      res.status(500).json({ error: "Failed to cast spell" });
    }
  });
  
  // Next round - transition from combat to building phase
  app.post("/api/game/:sessionId/next-round", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      let gameState = await storage.getGameState(sessionId);
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      if (gameState.gamePhase !== "combat") {
        return res.status(400).json({ error: "Can only advance to next round from combat phase" });
      }
      
      // Advance to next round
      gameState = nextRound(gameState);
      
      await storage.updateGameState(sessionId, gameState);
      
      res.json({ gameState });
    } catch (error) {
      console.error("Error advancing round:", error);
      res.status(500).json({ error: "Failed to advance round" });
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
