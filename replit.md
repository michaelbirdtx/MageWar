# Mage War - Spell Crafting Game

## Overview

Mage War is a turn-based spell-crafting game where players build custom spells by combining elemental components (Fire, Water, Earth, Air) and battle against an AI opponent. The game features a drag-and-drop interface for assembling spell components into powerful magical attacks, with tactical depth through mana management and elemental synergies. The application is a full-stack web game with real-time spell crafting, combat animations, and AI-powered opponent behavior.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

*   **Framework & Build System**: React 18 with TypeScript, Vite, Wouter for routing.
*   **UI/UX**: Shadcn/ui (Radix UI, Tailwind CSS), Framer Motion for animations, custom theming (light/dark modes), Cinzel and Inter fonts, elemental color schemes, responsive three-column layout.
*   **State Management**: TanStack Query for server state, local React state for UI, session-based game state.

### Backend

*   **Runtime & Server**: Node.js with Express.js REST API, TypeScript.
*   **API Design**: RESTful endpoints for game state (`/api/game/new`, `/api/game/:sessionId`, `/api/game/:sessionId/cast`).
*   **Game Logic**: Server-authoritative state, spell validation, damage calculation, AI opponent with strategic spell-building.
*   **Simultaneous Spell Reveal**: Player and AI spells are locked in and calculated simultaneously, with results displayed side-by-side in the Results Modal. The modal shows all spell effects (Damage in red, Shield in blue, Healing in green) for both player and AI, with creative material bonuses highlighted. Mana regenerates after both spells resolve.

### Data Storage

*   **Current Implementation**: In-memory storage for game and user sessions.
*   **Database Schema**: Configured for PostgreSQL via Drizzle ORM (schema in `shared/schema.ts`) for Users, Game State (JSONB), Spell Components, and Definitions.
*   **Data Models**: `SpellComponent`, `Spell`, `Mage`, `GameState`. Components are organized alphabetically by element in `gameData.ts`.

### Key Architectural Decisions

*   **Shared Type Definitions**: TypeScript types shared between client and server via a `shared/` directory for consistency.
*   **Component-Based Spell Building**: Spells are composable trees of components, enabling complex interactions and drag-and-drop editing. Child components can be individually removed.
*   **Session-Based State Management**: Each game session has a unique, isolated state, currently in-memory but prepared for database integration.
*   **AI Opponent Strategy**: Pre-defined, priority-based spell strategies with adjustable difficulty.
*   **Server-Side Game Logic**: All combat calculations and validation occur on the server to prevent cheating.
*   **Character Creation & Validation**: Players create custom mages with configurable Intellect, Stamina, and Wisdom, and a specialization (Pyromancer/Aquamancer). Comprehensive client and server-side validation ensures attribute integrity (min/max per attribute, max total).
*   **Win Condition System**: Atomic simultaneous damage resolution with `applySimultaneousDamage` and `checkGameEnd` functions to determine victory, defeat, or tie states (`building` | `combat` | `victory` | `defeat` | `tie`). Frontend dialogs display outcomes.
*   **AI Thinking Animation**: Visual feedback (3-6 second delay, AI card turns green) simulates AI "thinking" before locking in its spell choice.
*   **Universal Targeting System**: All spell effects (damage, shields, healing) target the opponent if a 'Gust' (propulsion) component is present within the spell's container, otherwise they target self. Shields reduce all incoming damage to the target.
*   **Pattern-Based Shield and Healing**: Shields require a 'Vortex' container + specific materials (Ice, Ember, or Sand). Healing requires a 'Vortex' container + all four elemental materials (Mist, Crystal, Ember, Lightning/Storm). Removed single-purpose shield/healing components; now materials are neutral. Healing detection takes priority over shield detection. Creative multi-element spell combinations still provide bonus damage and unique names.
*   **Multi-Spell-Per-Round System**: Players can cast up to 2 separate spells (containers with contents) per round, configurable by `MAX_SPELLS_PER_ROUND`. Validation ensures max containers, non-empty containers, and mana limits. A "Spell Breakdown" view details each spell's effects and target independently. AI adapts to cast multiple strategic spells.
*   **Drag-and-Drop Validation**: The spell builder enforces structural rules with immediate error feedback via toast notifications. Containers (Air Sphere, Vortex) can only be placed in the base spell area, not inside other containers. Materials and propulsion components must be placed inside containers, not in the base area. Each container accepts a maximum of 4 child components. All invalid drag operations display descriptive error messages explaining the constraint.
*   **One-Component-Per-Round Rule**: Enforces tactical variety by preventing any component from being used more than once within a single round across all spells. Visual feedback includes grayed-out components (opacity-40, grayscale filter, cursor-not-allowed) in the Component Library and disabled dragging (`draggable=false`). Attempting to reuse a component shows a toast notification. Backend validation in `validateSpell()` recursively checks for duplicate `baseId` values. AI spell generation respects this rule via `getComponentIds()` tracking (line 246 in `aiLogic.ts` uses `baseId || id`). Components reset to available state when a new round begins after clicking "Next Round" in the Results Modal. Each component card has `data-is-used` and `data-component-id` attributes for testing verification.

## Spell Naming System

### Material-Based Priority Naming
All spells use a unified naming system with priority-based cascade: **Specific Material Combos → Element Combos → Generic Fallback**. Names are generated dynamically per-container by `determineEffectNameBackend()` (backend) and `determineEffectName()` (frontend). Materials from different containers do NOT combine into combo names.

**Naming Priority Levels:**
1. **Specific Material Combinations** (Highest Priority)
   - 4+ materials: e.g., Magma + Sulfur + Crystal + Stone → "Crystal Inferno" (+6 bonus)
   - 3 materials: e.g., Magma + Sulfur + Crystal → "Volcanic Crystal" (+5 bonus)
   - 2 materials: e.g., Magma + Sulfur → "Sulfuric Blast" (+3 bonus)
   - Single high-value: e.g., Magma → "Magma Blast" (+2 bonus)

2. **Element-Based Combinations** (Medium Priority)
   - Multi-element: e.g., Fire + Water → "Steam Blast" (+3 bonus)
   - Single element: e.g., Fire → "Fire Blast" (no bonus)

3. **Generic Fallback** (Lowest Priority)
   - "Unknown Spell" if no patterns match

**Example Material Combos (Damage Spells):**
- **4-Material:** Boulder + Frost + Crystal + Stone → "Diamond Avalanche" (+6), Magma + Sand + Crystal + Stone → "Obsidian Cascade" (+6), Lightning + Storm + Sand + Crystal → "Fulgurite Tempest" (+6)
- **3-Material:** Magma + Sulfur + Crystal → "Volcanic Crystal" (+5), Boulder + Frost + Crystal → "Crystal Glacier" (+5), Sand + Crystal + Stone → "Crystal Sandstorm" (+5), Sand + Crystal + Lightning → "Glass Shard Storm" (+5), Magma + Sand + Crystal → "Molten Glass" (+5), Magma + Sulfur + Stone → "Magma Bomb" (+4), Boulder + Frost + Ice → "Frozen Avalanche" (+4), Sand + Stone + Sulfur → "Volcanic Sand" (+4), Storm + Sand + Lightning → "Sandstorm Surge" (+4), Boulder + Sand + Stone → "Earthen Avalanche" (+4), Boulder + Stone + Lightning → "Thunder Crash" (+4), Boulder + Stone + Sulfur → "Sulfur Barrage" (+4), Boulder + Lightning + Storm → "Thunder Boulder" (+4), Stone + Lightning + Storm → "Thunder Stone" (+4)
- **2-Material:** Frost + Ice → "Glacial Lance" (+3), Boulder + Stone → "Boulder Crash" (+3), Lightning + Storm → "Thunderstorm" (+3), Magma + Sulfur → "Sulfuric Blast" (+3), Sand + Crystal → "Crystal Sand" (+3), Sand + Stone → "Stone Barrage" (+3), Sand + Lightning → "Fulgurite Strike" (+3), Sand + Magma → "Glass Blast" (+3), Sand + Storm → "Sandstorm" (+3), Boulder + Sand → "Rock Slide" (+3), Boulder + Lightning → "Lightning Boulder" (+3), Boulder + Storm → "Storm Boulder" (+3), Boulder + Sulfur → "Sulfuric Rock" (+3), Stone + Lightning → "Lightning Stone" (+3), Stone + Storm → "Storm Stone" (+3), Stone + Magma → "Molten Stone" (+3), Stone + Frost → "Frozen Stone" (+3)
- **Cross-Element 2-Mat:** Magma + Frost → "Steam Eruption" (+4), Boulder + Ember → "Molten Rock" (+4), Lightning + Frost → "Frozen Lightning" (+4)
- **Single-Material:** Lightning → "Lightning Strike" (+2), Boulder → "Boulder Throw" (+2), Storm → "Storm Surge" (+2), Magma → "Magma Blast" (+2)

**Shield Spell Materials:**
- Ice + Crystal → "Crystal Barrier" (+2 bonus)
- Ember + Stone → "Molten Wall" (+2 bonus)
- Sand + Crystal → "Crystal Shield" (+2 bonus)
- Ice alone → "Ice Barrier", Ember alone → "Flame Guard", Sand alone → "Sand Wall"

**Healing Spell Materials:**
- Mist + Crystal → "Crystal Renewal" (+2 bonus)
- Fallback: Water → "Healing Waters", Earth → "Life Essence", Air → "Vital Breeze"

**Per-Container Scoping (Critical Design Rule):**
Materials are evaluated **within each container independently**. Multi-container builds combine names with " + " separator but do NOT cross-pollinate materials. Example:
- Container 1: Air Sphere [Gust, Magma, Sulfur] → "Sulfuric Blast" (+3)
- Container 2: Vortex [Ice] → "Ice Barrier"
- **Final Name:** "Sulfuric Blast + Ice Barrier" (NOT "Volcanic Crystal", which requires all 3 materials in ONE container)

### AI Spell Templates (Component Recipes)
AI uses predefined component combinations. Names are generated dynamically per-container like player spells:

**Fire-Focused (Pyromancer):**
- 38 mana: Air Sphere [Gust, Magma, Sulfur] → "Sulfuric Blast" (+3 bonus, ~26 dmg with spec)
- 40 mana: Air Sphere [Gust, Flame, Ember, Stone] → "Scorching Boulder" (+4 bonus if all 3 in container)
- 42 mana: Air Sphere [Gust, Magma, Flame] → "Volcanic Eruption" (+3 bonus, ~11 dmg with spec)

**Water-Focused (Aquamancer):**
- 46 mana: Air Sphere [Gust, Boulder, Frost, Crystal] → "Crystal Glacier" (+5 bonus, ~17 dmg with spec)
- 43 mana: Air Sphere [Gust, Boulder, Frost, Stone] → "Glacial Hammer" (+4 bonus, ~25 dmg with spec)
- 38 mana: Air Sphere [Gust, Storm, Frost] → "Frozen Storm" (+3 bonus, ~8 dmg with spec)

**Generic:**
- 34 mana: Air Sphere [Gust, Boulder, Stone] → "Boulder Crash" (+3 bonus)
- 38 mana: Air Sphere [Gust, Lightning, Storm] → "Thunderstorm" (+3 bonus)

### Specialization & Strategy
- AI filters spells by element composition: fire for Pyromancers, water for Aquamancers
- Priority: Damage → Heal (if health < 60%) → Second damage (if health > 80%) → Shield
- Specialization bonuses: +20% damage, -20% mana cost on matching elements
- AI can cast 2 spells per turn when healthy, leveraging the multi-spell system
- Material combo bonuses stack with specialization bonuses for powerful synergies

## External Dependencies

*   **Development & Build Tools**: Vite plugins (React, runtime error overlay, Replit cartographer), ESBuild, Drizzle Kit, TSX.
*   **UI & Interaction Libraries**: @radix-ui/\*, lucide-react, framer-motion, embla-carousel-react.
*   **Database & Sessions**: @neondatabase/serverless (PostgreSQL), connect-pg-simple (session store), drizzle-orm.
*   **Form & Validation**: react-hook-form, @hookform/resolvers, zod, drizzle-zod.
*   **Utilities**: clsx, tailwind-merge, class-variance-authority, date-fns, nanoid.