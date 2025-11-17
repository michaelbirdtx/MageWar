# Mage War - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from spell-crafting and card-building games like Hearthstone, Slay the Spire, and Magic: The Gathering Arena. The design balances tactical clarity with fantasy immersion—functional UI elements paired with mystical aesthetics.

**Core Principle**: "Readable magic" - Every component, container, and spell should be instantly recognizable while maintaining fantasy atmosphere. Prioritize drag-and-drop clarity over decorative flourishes.

---

## Typography

**Primary Font**: "Cinzel" (Google Fonts) - Medieval fantasy headers  
**Secondary Font**: "Inter" (Google Fonts) - UI elements, descriptions, combat text

**Hierarchy**:
- Game Title/Headers: Cinzel Bold, 2xl-4xl
- Section Labels: Cinzel Semibold, lg-xl  
- Component Names: Inter Semibold, base-lg
- Descriptions: Inter Regular, sm-base
- Combat Stats: Inter Bold, xl-2xl (for damage numbers)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 12  
- Component padding: p-4
- Container gaps: gap-4 to gap-6
- Section margins: m-6 to m-12
- Drag targets: min-h-24 with p-6

**Grid Structure**: Three-column desktop layout (grid-cols-3), stacking to single column on mobile

---

## Core Interface Sections

### 1. Component Library (Left Panel)
- **Layout**: Vertical scrolling grid (grid-cols-1)
- **Height**: Uses viewport-based height (max-h-[calc(100vh-240px)]) to maximize available vertical space
- **Component Cards**: Rounded-lg border-2, aspect-square containers
- **Element Categories**: Tabbed interface (Fire/Water/Earth/Air) with icon indicators
- **Visual Treatment**: Each component displays icon (Heroicons), name, and brief descriptor
- **Spacing**: gap-4 between cards, p-4 internal padding

### 2. Spell Builder (Center Panel - Primary Focus)
- **Spell Container**: Large drop zone using flex-1 to fill available vertical space (min-h-80) with overflow-y-auto for scrolling, dashed border-2 when empty, solid when populated
- **Height**: Grows to fill available vertical space while leaving room for spell calculation card below
- **Nested Containers**: Smaller drop zones (min-h-24) within parent containers, indent with ml-6 for hierarchy
- **Component Stack**: Vertical list showing build order with connector lines indicating relationships
- **Action Bar**: Below spell container with "Cast Spell", "Clear", "Save to Spellbook" buttons (space-x-4)
- **Validation Feedback**: Inline text (text-sm) below spell container showing requirements/errors

### 3. Battle Arena (Right Panel)
- **Combat View**: Split vertically - opponent top, player bottom
- **Mage Status Cards**: Each contains portrait placeholder, health bar (h-3 rounded-full), mana bar (h-2 rounded-full), status effects
- **Spell Animation Zone**: Center area (h-48) for cast spell visual feedback
- **Turn Indicator**: Prominent banner showing whose turn (p-2 rounded-md)

---

## Component Design

### Draggable Elements
- **Default State**: Rounded-lg, p-3, border, cursor-grab
- **Dragging State**: Reduced opacity (opacity-60), cursor-grabbing, slight rotate
- **Drop Zones**: Dashed border when accepting drag, solid when hovering valid component
- **Invalid Drop**: Red dashed border (do not specify color value - just semantic meaning)

### Buttons
- **Primary Actions** (Cast/Attack): Large (px-8 py-3), rounded-md, font-semibold
- **Secondary Actions** (Save/Clear): Medium (px-6 py-2), rounded-md
- **Tab Switches**: Minimal styling, border-b-2 on active state

### Cards & Containers
- **Spell Container**: Rounded-xl, border-2, p-6, min-h-64
- **Component Cards**: Rounded-lg, border, p-4, shadow-sm
- **Mage Cards**: Rounded-lg, border, p-5, includes avatar circle (w-16 h-16 rounded-full)

### Icons
**Library**: Heroicons (via CDN)  
**Usage**:
- Fire: Flame icon
- Water: Beaker/droplet icon  
- Earth: Cube icon
- Air: Wind icon
- Health: Heart icon
- Mana: Sparkles icon
- Attack: Bolt icon

---

## Game States & Flows

### Spell Building Mode
- Component library active and scrollable
- Spell builder accepts drops
- Battle arena shows "waiting" state

### Combat Mode
- Component library minimized/hidden
- Spell builder shows active spell with "Cast" button
- Battle arena animated and interactive

### Tutorial/Onboarding
- Modal overlay (rounded-xl, p-8, max-w-2xl) with step-by-step spell building
- Highlight zones using subtle border emphasis
- "Next Step" button (bottom-right of modal)

---

## Responsive Behavior

**Desktop (lg+)**: Three-column grid  
**Tablet (md)**: Two-column (library + builder top, arena bottom)  
**Mobile**: Single column stack (tabs to switch between library/builder/arena)

---

## Animations

**Minimal & Purposeful Only**:
- Drag preview: Transform scale on pickup (scale-105)
- Spell cast: Simple fade-out from builder to arena
- Damage numbers: Brief slide-up animation (translate-y)
- Turn transition: Quick fade between states

**Avoid**: Excessive particle effects, looping backgrounds, constant pulsing

---

## Images

**No hero section needed** - this is a game interface, not a landing page.

**Avatar Placeholders**: Circular mage portraits (w-16 h-16) - use geometric placeholder patterns or initials  
**Component Icons**: Vector icons only (Heroicons), no custom imagery  
**Background**: Subtle texture pattern (if any) should not distract from gameplay

---

## Accessibility

- All drag zones have visible borders (not just color-coded)
- Keyboard navigation: Arrow keys to browse components, Enter to select/place
- Screen reader labels for all interactive elements
- High contrast between text and backgrounds
- Focus indicators on all interactive elements (ring-2 ring-offset-2)

---

## Special Considerations

**Spell Validation**: Real-time feedback showing compatible/incompatible component combinations with clear text indicators

**Nested Visualization**: Use indentation (ml-6, ml-12) and connector lines (border-l) to show component hierarchy within spells

**Combat Feedback**: Damage numbers and effects appear briefly in animation zone, then update health/mana bars with smooth transitions

**Mobile Drag-and-Drop**: Implement touch-friendly hit targets (min 44px), long-press to initiate drag on touch devices