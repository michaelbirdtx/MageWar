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
*   **Simultaneous Spell Reveal**: Player and AI spells are locked in and calculated simultaneously, with results displayed side-by-side. Mana regenerates after both spells resolve.

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

## External Dependencies

*   **Development & Build Tools**: Vite plugins (React, runtime error overlay, Replit cartographer), ESBuild, Drizzle Kit, TSX.
*   **UI & Interaction Libraries**: @radix-ui/\*, lucide-react, framer-motion, embla-carousel-react.
*   **Database & Sessions**: @neondatabase/serverless (PostgreSQL), connect-pg-simple (session store), drizzle-orm.
*   **Form & Validation**: react-hook-form, @hookform/resolvers, zod, drizzle-zod.
*   **Utilities**: clsx, tailwind-merge, class-variance-authority, date-fns, nanoid.