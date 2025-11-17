# Mage War - Spell Crafting Game

## Overview

Mage War is a turn-based spell-crafting game where players build custom spells by combining elemental components (Fire, Water, Earth, Air) and battle against an AI opponent. The game features a drag-and-drop interface for assembling spell components into powerful magical attacks, with tactical depth through mana management and elemental synergies.

The application is built as a full-stack web game with real-time spell crafting, combat animations, and AI-powered opponent behavior.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component Library**
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Framer Motion for spell casting animations and combat effects
- Custom theming system supporting light/dark modes

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local React state for UI interactions (drag-and-drop, spell building)
- Session-based game state synchronized with backend

**Design System**
- Typography: Cinzel (fantasy headers) and Inter (UI elements)
- Spacing primitives based on Tailwind's 2/4/6/12 unit system
- Element-specific color schemes (Fire: red, Water: blue, Earth: amber, Air: cyan)
- Three-column desktop layout collapsing to single column on mobile

### Backend Architecture

**Runtime & Server**
- Node.js with Express.js REST API
- TypeScript for full-stack type safety
- In-development mode: Vite middleware integration for HMR

**API Design**
- RESTful endpoints for game state management:
  - `POST /api/game/new` - Initialize new game session
  - `GET /api/game/:sessionId` - Retrieve current game state
  - `POST /api/game/:sessionId/cast` - Cast player spell with simultaneous AI response
  - `POST /api/game/:sessionId/ai-turn` - (Legacy, no longer used)

**Game Logic**
- Server-authoritative game state (health, mana, turn order)
- Spell validation and damage calculation on backend
- AI opponent with strategic spell-building algorithms
- **Simultaneous spell reveal system** (implemented November 17, 2025):
  - Player locks in spell → AI immediately generates counter-spell
  - Both spells calculated and applied simultaneously
  - Mage cards display green backgrounds during lock-in phase
  - Split results display shows both spell effects side-by-side
  - Mana regeneration occurs after both spells resolve

### Data Storage

**Current Implementation**
- In-memory storage using Map-based data structures
- Session-based game state storage (no persistence)
- User management with simple in-memory user store

**Database Schema (Drizzle ORM)**
- Configured for PostgreSQL via Drizzle ORM
- Schema defined in `shared/schema.ts`:
  - Users table with username/password authentication
  - Game state stored as JSONB for flexibility
  - Spell components and definitions as TypeScript interfaces

**Data Models**
- `SpellComponent`: Elemental building blocks (element, type, manaCost, children for nesting)
- `Spell`: Assembled spell with total stats (damage, manaCost, effect)
- `Mage`: Player/opponent state (health, mana, stats)
- `GameState`: Complete game state (player, opponent, currentTurn, gamePhase)
- Component organization: All components in `gameData.ts` are sorted alphabetically - first by element (Air, Earth, Fire, Water), then by component name within each element

### External Dependencies

**Development & Build Tools**
- Vite plugins: React, runtime error overlay, Replit cartographer & dev banner
- ESBuild for server-side bundling in production
- Drizzle Kit for database migrations
- TSX for TypeScript execution in development

**UI & Interaction Libraries**
- @radix-ui/* components (30+ component primitives)
- lucide-react for iconography
- framer-motion for animations
- embla-carousel-react for potential tutorial/gallery features

**Database & Sessions**
- @neondatabase/serverless for PostgreSQL connection
- connect-pg-simple for session store (configured but not actively used)
- drizzle-orm for type-safe database queries

**Form & Validation**
- react-hook-form with @hookform/resolvers
- zod for schema validation
- drizzle-zod for database schema validation

**Utilities**
- clsx & tailwind-merge via cn() utility
- class-variance-authority for component variants
- date-fns for date manipulation
- nanoid for unique ID generation

### Key Architectural Decisions

**Shared Type Definitions**
- TypeScript types shared between client and server via `shared/` directory
- Single source of truth for game models prevents type mismatches
- Alternative considered: Separate type definitions per layer (rejected due to duplication risk)

**Component-Based Spell Building**
- Spells are composable trees of components (containers can hold children)
- Enables complex spell interactions and emergent gameplay
- Drag-and-drop interaction pattern matches card-game inspiration
- Child components can be individually removed from containers without deleting the parent
- Hover-activated remove buttons on both parent and child components for flexible spell editing

**Session-Based State Management**
- Each game session has unique ID with isolated state
- Allows potential for spectating or saving game states
- Currently in-memory; database integration prepared but not active

**AI Opponent Strategy**
- Pre-defined spell strategies with priority-based selection
- AI difficulty can be adjusted (easy/medium/hard)
- Alternative considered: Random component selection (rejected as too chaotic)

**Server-Side Game Logic**
- All combat calculations and validation happen server-side
- Prevents client-side cheating and maintains game integrity
- Client receives only authorized state updates

**Character Creation & Validation System**
- Players create custom mages before battle with configurable attributes
- Attribute system: Intellect (affects maxMana), Stamina (affects maxHealth), Wisdom (affects manaRegen)
- Specialization system: Pyromancer (fire +20% damage, -20% cost) or Aquamancer (water +20% damage, -20% cost)
- Comprehensive validation enforces:
  - Name: Non-empty trimmed string
  - Specialization: Must be "pyromancer" or "aquamancer"
  - Attributes: Integer values only
  - Minimum per attribute: 6
  - Maximum per attribute: 16 (base 10 + 6 free points)
  - Maximum total attributes: 36 (prevents redistribution exploits)
- Both client-side UI guards and server-side validation prevent stat inflation
- AI strategically generates character builds matching combat style and specialization
- Date implemented: November 16, 2025

**Win Condition System**
- Implemented atomic simultaneous damage resolution with correct victory/defeat/tie detection
- **Game Phase Values**: "building" | "combat" | "victory" | "defeat" | "tie"
- **Core Functions** (server/gameLogic.ts):
  - `applySimultaneousDamage(state, damageToPlayer, damageToOpponent)`: Applies both damages in single atomic operation
  - `checkGameEnd(state)`: Examines both health values after damage to determine outcome
    - Both <= 0 → "tie"
    - Only player <= 0 → "defeat"
    - Only opponent <= 0 → "victory"
- **Combat Resolution Flow**:
  1. Accumulate damage from both player and AI spells
  2. Apply all damage simultaneously via applySimultaneousDamage
  3. Call checkGameEnd to determine game outcome
  4. Set gamePhase to "combat" only if game continues
- **Frontend Dialogs**: Three end-game dialogs (victory, defeat, tie) automatically shown based on gamePhase
- Ensures correct tie detection when both combatants reach 0 health in same round
- Fixes bug where victories weren't announced due to sequential damage application
- Date implemented: November 17, 2025

**AI Thinking Animation**
- Visual feedback showing AI "thinking" before locking in spell choice
- **Implementation Details**:
  - `aiThinkingLock` state triggers random 3-6 second delay when round starts
  - AI's mage card displays green background after delay
  - Thinking lock persists until combat lock takes over (no visual flash)
  - Resets when starting new game or clicking "Play Again"
- **State Flow**:
  1. Round begins (gamePhase = "building")
  2. Random delay (3000-6000ms)
  3. AI card turns green (aiThinkingLock = true)
  4. Player casts spell → AI card stays green (thinking lock active)
  5. Server responds → Combat locks activate (both cards green)
  6. Results modal → Thinking lock cleared for next round
- **Purpose**: Creates realistic AI behavior impression, making opponent feel more lifelike
- Date implemented: November 17, 2025

**Multi-Container Spell System with Shields, Healing & Creative Discovery**
- Players and AI can cast 1-3 containers per turn combining offensive, defensive, and healing effects
- **Component Effect Types**:
  - **Damage Materials**: Flame, Ember, Magma (Fire), Stone, Boulder (Earth), Lightning, Storm (Air)
  - **Shield Materials**: Ice, Crystal (Water), Wind (Air), Flame Guard (Fire)
  - **Healing Materials**: Water, Mist (Water), Clay (Earth), Vital Breeze (Air)
- **Spell Targeting Logic** (fixed November 17, 2025):
  - Pure damage spells → target opponent
  - Mixed spells with damage → target opponent
  - Pure shield/healing spells → target self
  - Previous bug: relied on propulsion component presence, now correctly uses effect type
- **Creative Spell Combinations**:
  - Multi-element spells receive unique discovered names and +2 to +5 bonus damage
  - Examples: Fire+Water="Steam Blast", Fire+Earth="Lava Burst", Fire+Air="Firestorm"
  - Displayed with purple highlighting in UI to emphasize discovery gameplay
  - Bonus damage stacks with specialization bonuses
- **Combat Resolution Order** (server/gameLogic.ts):
  1. Shields applied to both player and opponent
  2. Damage dealt (reduced by active shields)
  3. Healing applied after damage
  4. Win conditions checked
- **AI Multi-Container Strategy** (server/aiLogic.ts):
  - Strategic mode (80%): Builds 1-3 containers based on health/mana/opponent state
    - Low health → prioritize shields and healing
    - High health → prioritize damage
    - Balanced approach when moderate health
  - Experimental mode (20%): Attempts creative multi-element combinations for discovery
  - AI adapts container count to available mana
- **UI Enhancements**:
  - SpellBuilder displays damage/shield/healing stats separately
  - Discovered spell names shown prominently with purple highlight
  - Creative bonuses indicated in both builder and results modal
  - ResultsModal shows comprehensive breakdown: damage dealt, shields applied, healing received
- **Schema Updates** (shared/schema.ts):
  - Added `effectType: 'damage' | 'shield' | 'healing'` to SpellComponent
  - Added `shieldPower`, `healingPower`, `bonus` fields to SpellComponent and Spell interfaces
  - Maintains backward compatibility with existing damage-only spells
- Date implemented: November 17, 2025