# Design Document: Additional Waiting Card Color Themes

## Overview

This design specifies 10 new light-themed color presets for the queue management system's waiting card display. The themes expand the current library (5 light, 10 dark) with distinctive, non-generic aesthetics across three categories: pastel colors, watercolor-inspired palettes, and nature-inspired schemes.

### Design Goals

1. **Visual Distinctiveness**: Each theme has a unique color identity, clearly distinguishable from existing themes
2. **Category Diversity**: Balanced distribution across pastel (3), watercolor (2), and nature-inspired (5) themes
3. **Professional Quality**: All themes maintain WCAG AA contrast ratios and professional polish
4. **Seamless Integration**: Themes work across all 6 existing card layouts without modification
5. **Brand Flexibility**: Provide restaurant owners with diverse aesthetic options matching various brand identities

### Existing Light Themes (Reference)

The system currently has 5 light themes:
- **Paper** (📜): Warm beige/brown tones, parchment aesthetic
- **Frost** (❄️): Cool blue tones, crisp and clean
- **Matcha** (🍵): Green tones, tea-inspired
- **Peach** (🍑): Warm orange/coral tones, fruity
- **Lavender** (💜): Purple tones, floral

New themes must be visually distinct from these existing palettes.

## Architecture

### Theme System Structure

The theme system uses a token-based architecture where each `ThemeColors` object defines 14 color properties that work across 6 card layout components:

```
ThemeColors (14 tokens)
    ↓
THEME_PRESETS array (types.ts)
    ↓
Card Layouts (6 components)
    - ClassicCard
    - TicketStrip
    - RadialHub
    - SplitScreen
    - TimelineJourney
    - CardStack
```

### Color Token System

Each theme defines these tokens:
- **Identity**: `id`, `label`, `emoji`, `mode`
- **Backgrounds**: `pageBg`, `cardBg`, `surface`
- **Borders**: `cardBorder`, `surfaceBorder`
- **Primary Colors**: `primary`, `primaryLight`, `primaryDim`, `primaryFaint`
- **Effects**: `glow`, `numberGradient`, `numberGlow`

## Components and Interfaces

### Theme Preset Structure

Each new theme follows the `ThemeColors` TypeScript interface:

```typescript
{
  id: string;              // kebab-case identifier
  label: string;           // Display name
  emoji: string;           // Visual identifier
  mode: 'light';           // All new themes are light mode
  pageBg: string;          // Tailwind class: bg-[#hexcode]
  cardBg: string;          // CSS gradient or solid color
  cardBorder: string;      // rgba() color
  primary: string;         // Main accent color (hex)
  primaryLight: string;    // Dark variant for text (hex)
  primaryDim: string;      // Semi-transparent (rgba)
  primaryFaint: string;    // Very subtle (rgba)
  surface: string;         // Tile background (rgba)
  surfaceBorder: string;   // Tile border (rgba)
  glow: string;            // Shadow color (rgba)
  numberGradient: string;  // CSS gradient for queue number
  numberGlow: string;      // drop-shadow filter
}
```

### Integration Points

The new themes integrate at a single point:
- **File**: `src/components/waiting-cards/types.ts`
- **Array**: `THEME_PRESETS`
- **Position**: Append after existing light themes (after 'lavender')

No changes required to:
- Card layout components
- Theme selector UI
- Type definitions

## Data Models

### Theme Categories

#### Pastel Themes (3 themes)

Soft, desaturated colors with high lightness values. Gentle gradients for depth.

**1. Mint Cream** 🌿
- **Color Family**: Soft mint green
- **Aesthetic**: Gentle, refreshing, spa-like
- **Primary**: `#6ee7b7` (emerald-300)
- **Use Case**: Wellness-focused, organic cafes

**2. Rose Quartz** 🌹
- **Color Family**: Soft dusty rose
- **Aesthetic**: Romantic, elegant, gentle
- **Primary**: `#f9a8d4` (pink-300)
- **Use Case**: Bakeries, brunch spots, feminine brands

**3. Sky Whisper** ☁️
- **Color Family**: Soft powder blue
- **Aesthetic**: Calm, airy, serene
- **Primary**: `#93c5fd` (blue-300)
- **Use Case**: Coastal restaurants, modern cafes

#### Watercolor Themes (2 themes)

Fluid color transitions with multiple harmonious colors blending. Soft, diffused effects.

**4. Coral Reef** 🪸
- **Color Blend**: Coral pink + turquoise + peach
- **Aesthetic**: Tropical, vibrant yet soft, underwater
- **Primary**: `#fb7185` (rose-400)
- **Use Case**: Seafood restaurants, tropical themes

**5. Sunset Bloom** 🌺
- **Color Blend**: Warm pink + golden yellow + soft orange
- **Aesthetic**: Dreamy, warm, artistic
- **Primary**: `#fbbf24` (amber-400)
- **Use Case**: Evening dining, artistic venues

#### Nature-Inspired Themes (5 themes)

Colors drawn from natural environments with organic combinations.

**6. Sage Garden** 🌿
- **Natural Source**: Sage leaves, herb gardens
- **Color Family**: Muted sage green
- **Aesthetic**: Earthy, botanical, organic
- **Primary**: `#84cc16` (lime-500)
- **Use Case**: Farm-to-table, organic restaurants

**7. Terracotta Clay** 🏺
- **Natural Source**: Clay pottery, desert earth
- **Color Family**: Warm terracotta/rust
- **Aesthetic**: Rustic, Mediterranean, warm
- **Primary**: `#ea580c` (orange-600)
- **Use Case**: Italian, Mediterranean, rustic venues

**8. Cherry Blossom** 🌸
- **Natural Source**: Spring cherry blossoms
- **Color Family**: Soft pink with warm undertones
- **Aesthetic**: Delicate, spring-like, Japanese-inspired
- **Primary**: `#f472b6` (pink-400)
- **Use Case**: Japanese restaurants, spring themes

**9. Ocean Foam** 🌊
- **Natural Source**: Sea foam, coastal waters
- **Color Family**: Soft teal/cyan
- **Aesthetic**: Coastal, fresh, breezy
- **Primary**: `#22d3ee` (cyan-400)
- **Use Case**: Seafood, coastal, beach-themed

**10. Honey Glow** 🍯
- **Natural Source**: Golden honey, warm sunlight
- **Color Family**: Warm golden yellow
- **Aesthetic**: Warm, inviting, natural sweetness
- **Primary**: `#fbbf24` (amber-400)
- **Use Case**: Breakfast spots, bakeries, cozy cafes

### Complete Theme Specifications


#### Theme 1: Mint Cream

```typescript
{
  id: 'mint-cream',
  label: 'Mint Cream',
  emoji: '🌿',
  mode: 'light',
  pageBg: 'bg-[#ecfdf5]',
  cardBg: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
  cardBorder: 'rgba(16,185,129,0.18)',
  primary: '#10b981',
  primaryLight: '#065f46',
  primaryDim: 'rgba(6,95,70,0.5)',
  primaryFaint: 'rgba(16,185,129,0.06)',
  surface: 'rgba(16,185,129,0.05)',
  surfaceBorder: 'rgba(16,185,129,0.1)',
  glow: 'rgba(16,185,129,0.08)',
  numberGradient: 'linear-gradient(180deg, #6ee7b7, #10b981, #059669)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(16,185,129,0.2))',
}
```

**Design Rationale**:
- Soft mint green creates a refreshing, spa-like atmosphere
- Distinct from existing matcha theme (which uses deeper, tea-inspired greens)
- Pastel category: high lightness, low saturation
- Gradient uses very subtle transitions for gentle depth

#### Theme 2: Rose Quartz

```typescript
{
  id: 'rose-quartz',
  label: 'Rose Quartz',
  emoji: '🌹',
  mode: 'light',
  pageBg: 'bg-[#fdf2f8]',
  cardBg: 'linear-gradient(155deg, #fef3f9 0%, #fdf2f8 50%, #fef3f9 100%)',
  cardBorder: 'rgba(236,72,153,0.18)',
  primary: '#ec4899',
  primaryLight: '#831843',
  primaryDim: 'rgba(131,24,67,0.5)',
  primaryFaint: 'rgba(236,72,153,0.06)',
  surface: 'rgba(236,72,153,0.05)',
  surfaceBorder: 'rgba(236,72,153,0.1)',
  glow: 'rgba(236,72,153,0.08)',
  numberGradient: 'linear-gradient(180deg, #f9a8d4, #ec4899, #be185d)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(236,72,153,0.2))',
}
```

**Design Rationale**:
- Dusty rose with elegant, romantic feel
- Distinct from peach (which is orange-toned) and lavender (which is purple-toned)
- Pastel category: soft pink with reduced saturation
- Suitable for bakeries, brunch spots, feminine brands

#### Theme 3: Sky Whisper

```typescript
{
  id: 'sky-whisper',
  label: 'Sky Whisper',
  emoji: '☁️',
  mode: 'light',
  pageBg: 'bg-[#eff6ff]',
  cardBg: 'linear-gradient(145deg, #f0f9ff 0%, #eff6ff 50%, #f0f9ff 100%)',
  cardBorder: 'rgba(59,130,246,0.18)',
  primary: '#3b82f6',
  primaryLight: '#1e3a8a',
  primaryDim: 'rgba(30,58,138,0.5)',
  primaryFaint: 'rgba(59,130,246,0.06)',
  surface: 'rgba(59,130,246,0.05)',
  surfaceBorder: 'rgba(59,130,246,0.1)',
  glow: 'rgba(59,130,246,0.08)',
  numberGradient: 'linear-gradient(180deg, #93c5fd, #3b82f6, #1d4ed8)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(59,130,246,0.2))',
}
```

**Design Rationale**:
- Soft powder blue, lighter and airier than existing frost theme
- Pastel category: very light blue with gentle saturation
- Evokes calm sky, clouds, serenity
- Distinct from frost which uses cooler, crisper blues

#### Theme 4: Coral Reef

```typescript
{
  id: 'coral-reef',
  label: 'Coral Reef',
  emoji: '🪸',
  mode: 'light',
  pageBg: 'bg-[#fef2f2]',
  cardBg: 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 30%, #ecfeff 70%, #fef2f2 100%)',
  cardBorder: 'rgba(251,113,133,0.2)',
  primary: '#fb7185',
  primaryLight: '#881337',
  primaryDim: 'rgba(136,19,55,0.5)',
  primaryFaint: 'rgba(251,113,133,0.06)',
  surface: 'rgba(251,113,133,0.05)',
  surfaceBorder: 'rgba(251,113,133,0.12)',
  glow: 'rgba(251,113,133,0.12)',
  numberGradient: 'linear-gradient(135deg, #fb7185, #06b6d4, #fbbf24)',
  numberGlow: 'drop-shadow(0 2px 12px rgba(251,113,133,0.25))',
}
```

**Design Rationale**:
- Watercolor category: blends coral pink, turquoise, and peach
- Multi-color gradient creates fluid, underwater aesthetic
- Distinct from all existing themes with its tropical color blend
- Number gradient uses three colors for watercolor effect

#### Theme 5: Sunset Bloom

```typescript
{
  id: 'sunset-bloom',
  label: 'Sunset Bloom',
  emoji: '🌺',
  mode: 'light',
  pageBg: 'bg-[#fef3c7]',
  cardBg: 'linear-gradient(150deg, #fef3c7 0%, #fed7aa 35%, #fecaca 70%, #fef3c7 100%)',
  cardBorder: 'rgba(251,191,36,0.2)',
  primary: '#fbbf24',
  primaryLight: '#78350f',
  primaryDim: 'rgba(120,53,15,0.5)',
  primaryFaint: 'rgba(251,191,36,0.06)',
  surface: 'rgba(251,191,36,0.05)',
  surfaceBorder: 'rgba(251,191,36,0.12)',
  glow: 'rgba(251,191,36,0.12)',
  numberGradient: 'linear-gradient(150deg, #fbbf24, #fb923c, #f87171)',
  numberGlow: 'drop-shadow(0 2px 12px rgba(251,191,36,0.25))',
}
```

**Design Rationale**:
- Watercolor category: warm pink, golden yellow, soft orange blend
- Dreamy sunset aesthetic with artistic, hand-painted feel
- Distinct from peach (single color) with multi-color watercolor blend
- Soft transitions create diffused, artistic effect

#### Theme 6: Sage Garden

```typescript
{
  id: 'sage-garden',
  label: 'Sage Garden',
  emoji: '🌿',
  mode: 'light',
  pageBg: 'bg-[#f7fee7]',
  cardBg: 'linear-gradient(160deg, #fefce8 0%, #f7fee7 50%, #fefce8 100%)',
  cardBorder: 'rgba(132,204,22,0.18)',
  primary: '#84cc16',
  primaryLight: '#365314',
  primaryDim: 'rgba(54,83,20,0.5)',
  primaryFaint: 'rgba(132,204,22,0.06)',
  surface: 'rgba(132,204,22,0.05)',
  surfaceBorder: 'rgba(132,204,22,0.1)',
  glow: 'rgba(132,204,22,0.08)',
  numberGradient: 'linear-gradient(180deg, #a3e635, #84cc16, #4d7c0f)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(132,204,22,0.2))',
}
```

**Design Rationale**:
- Nature-inspired: sage leaves, herb gardens
- Muted yellow-green, distinct from matcha's pure green
- Earthy, botanical aesthetic for farm-to-table restaurants
- Organic color palette with natural warmth

#### Theme 7: Terracotta Clay

```typescript
{
  id: 'terracotta-clay',
  label: 'Terracotta Clay',
  emoji: '🏺',
  mode: 'light',
  pageBg: 'bg-[#fff7ed]',
  cardBg: 'linear-gradient(160deg, #fffbf5 0%, #fff7ed 50%, #fffbf5 100%)',
  cardBorder: 'rgba(234,88,12,0.2)',
  primary: '#ea580c',
  primaryLight: '#7c2d12',
  primaryDim: 'rgba(124,45,18,0.5)',
  primaryFaint: 'rgba(234,88,12,0.06)',
  surface: 'rgba(234,88,12,0.05)',
  surfaceBorder: 'rgba(234,88,12,0.1)',
  glow: 'rgba(234,88,12,0.08)',
  numberGradient: 'linear-gradient(180deg, #fb923c, #ea580c, #9a3412)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(234,88,12,0.2))',
}
```

**Design Rationale**:
- Nature-inspired: clay pottery, desert earth
- Warm rust/terracotta tones
- Similar to peach but more earthy and rustic (peach is fruitier)
- Mediterranean, rustic aesthetic

#### Theme 8: Cherry Blossom

```typescript
{
  id: 'cherry-blossom',
  label: 'Cherry Blossom',
  emoji: '🌸',
  mode: 'light',
  pageBg: 'bg-[#fef1f7]',
  cardBg: 'linear-gradient(155deg, #fef5fa 0%, #fef1f7 50%, #fef5fa 100%)',
  cardBorder: 'rgba(244,114,182,0.18)',
  primary: '#f472b6',
  primaryLight: '#831843',
  primaryDim: 'rgba(131,24,67,0.5)',
  primaryFaint: 'rgba(244,114,182,0.06)',
  surface: 'rgba(244,114,182,0.05)',
  surfaceBorder: 'rgba(244,114,182,0.1)',
  glow: 'rgba(244,114,182,0.08)',
  numberGradient: 'linear-gradient(180deg, #f9a8d4, #f472b6, #db2777)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(244,114,182,0.2))',
}
```

**Design Rationale**:
- Nature-inspired: spring cherry blossoms
- Soft pink with warm undertones, distinct from rose quartz (cooler)
- Delicate, Japanese-inspired aesthetic
- Spring-like, fresh feeling

#### Theme 9: Ocean Foam

```typescript
{
  id: 'ocean-foam',
  label: 'Ocean Foam',
  emoji: '🌊',
  mode: 'light',
  pageBg: 'bg-[#ecfeff]',
  cardBg: 'linear-gradient(145deg, #f0fdff 0%, #ecfeff 50%, #f0fdff 100%)',
  cardBorder: 'rgba(34,211,238,0.18)',
  primary: '#22d3ee',
  primaryLight: '#164e63',
  primaryDim: 'rgba(22,78,99,0.5)',
  primaryFaint: 'rgba(34,211,238,0.06)',
  surface: 'rgba(34,211,238,0.05)',
  surfaceBorder: 'rgba(34,211,238,0.1)',
  glow: 'rgba(34,211,238,0.08)',
  numberGradient: 'linear-gradient(180deg, #67e8f9, #22d3ee, #0891b2)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(34,211,238,0.2))',
}
```

**Design Rationale**:
- Nature-inspired: sea foam, coastal waters
- Soft teal/cyan, distinct from frost (which is blue) and sky whisper (powder blue)
- Coastal, breezy aesthetic
- Fresh, aquatic feeling

#### Theme 10: Honey Glow

```typescript
{
  id: 'honey-glow',
  label: 'Honey Glow',
  emoji: '🍯',
  mode: 'light',
  pageBg: 'bg-[#fefce8]',
  cardBg: 'linear-gradient(160deg, #fffef5 0%, #fefce8 50%, #fffef5 100%)',
  cardBorder: 'rgba(251,191,36,0.2)',
  primary: '#fbbf24',
  primaryLight: '#713f12',
  primaryDim: 'rgba(113,63,18,0.5)',
  primaryFaint: 'rgba(251,191,36,0.06)',
  surface: 'rgba(251,191,36,0.05)',
  surfaceBorder: 'rgba(251,191,36,0.12)',
  glow: 'rgba(251,191,36,0.08)',
  numberGradient: 'linear-gradient(180deg, #fde047, #fbbf24, #d97706)',
  numberGlow: 'drop-shadow(0 2px 10px rgba(251,191,36,0.2))',
}
```

**Design Rationale**:
- Nature-inspired: golden honey, warm sunlight
- Warm golden yellow, distinct from all existing themes
- Inviting, natural sweetness
- Perfect for breakfast spots, bakeries, cozy cafes

### Theme Distribution Summary

| Category | Count | Themes |
|----------|-------|--------|
| Pastel | 3 | Mint Cream, Rose Quartz, Sky Whisper |
| Watercolor | 2 | Coral Reef, Sunset Bloom |
| Nature-Inspired | 5 | Sage Garden, Terracotta Clay, Cherry Blossom, Ocean Foam, Honey Glow |
| **Total** | **10** | |

### Color Distinctiveness Matrix

Each theme uses a unique primary color hue:

| Theme | Primary Hue | Hex | Distinct From |
|-------|-------------|-----|---------------|
| Mint Cream | Green (emerald) | #10b981 | Matcha (deeper green), Sage (yellow-green) |
| Rose Quartz | Pink (rose) | #ec4899 | Peach (orange), Lavender (purple), Cherry Blossom (warmer pink) |
| Sky Whisper | Blue (sky) | #3b82f6 | Frost (deeper blue), Ocean Foam (cyan) |
| Coral Reef | Pink-red (coral) | #fb7185 | Rose Quartz (cooler), Peach (orange) |
| Sunset Bloom | Yellow (amber) | #fbbf24 | Honey Glow (same hue, different context) |
| Sage Garden | Yellow-green (lime) | #84cc16 | Matcha (pure green), Mint Cream (blue-green) |
| Terracotta Clay | Orange (rust) | #ea580c | Peach (lighter, fruitier) |
| Cherry Blossom | Pink (warm) | #f472b6 | Rose Quartz (cooler), Lavender (purple) |
| Ocean Foam | Cyan (teal) | #22d3ee | Frost (blue), Sky Whisper (blue) |
| Honey Glow | Yellow (amber) | #fbbf24 | Sunset Bloom (multi-color watercolor) |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing correctness properties, I need to analyze the acceptance criteria for testability:


### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties:

**Identified Properties:**
1. Mode validation (1.2) - All new themes have mode: 'light'
2. Structure validation (1.5) - id is kebab-case, label and emoji are non-empty
3. Complete token definition (2.1) - All 14 properties exist
4. Format validation (2.2, 8.4) - Color values match expected formats
5. Contrast validation (3.4, 7.1, 7.2) - WCAG AA contrast for primaryLight
6. Secondary contrast (7.3) - WCAG contrast for primaryDim
7. Gradient color count (4.3) - Watercolor themes have multiple colors
8. Unique hues (6.1) - No duplicate primary color hues
9. Unique emojis (6.2) - No duplicate emojis
10. TypeScript conformance (8.1) - Matches ThemeColors interface

**Redundancy Analysis:**
- Properties 2.2 and 8.4 are identical (format validation) → **Combine into Property 2**
- Properties 3.4, 7.1, and 7.2 all test primaryLight contrast → **Combine into Property 3**
- Property 8.1 (TypeScript conformance) is enforced by the compiler and subsumes property 2.1 (complete token definition) → **Keep Property 1 for runtime validation, remove 8.1 as redundant**

**Final Properties (after removing redundancy):**
1. **Complete Structure** - Combines token completeness (2.1) and format validation (2.2, 8.4)
2. **Mode Consistency** - All new themes are light mode (1.2)
3. **Identity Format** - id, label, emoji format validation (1.5)
4. **Primary Contrast** - WCAG AA for primaryLight (3.4, 7.1, 7.2)
5. **Secondary Contrast** - WCAG contrast for primaryDim (7.3)
6. **Unique Hues** - No duplicate primary hues (6.1)
7. **Unique Emojis** - No duplicate emojis (6.2)

Note: Property 4.3 (watercolor gradient colors) is too specific to watercolor themes and doesn't apply universally, so it's better suited for example-based tests.

### Property 1: Complete Theme Structure

*For any* new theme added to THEME_PRESETS, it SHALL define all 14 required properties (id, label, emoji, mode, pageBg, cardBg, cardBorder, primary, primaryLight, primaryDim, primaryFaint, surface, surfaceBorder, glow, numberGradient, numberGlow) with values matching the expected formats:
- `pageBg`: Tailwind class starting with 'bg-'
- `cardBg`: CSS color value or gradient
- `cardBorder`, `primaryDim`, `primaryFaint`, `surface`, `surfaceBorder`, `glow`: rgba() format or hex
- `primary`, `primaryLight`: hex color format
- `numberGradient`: CSS gradient or 'none'
- `numberGlow`: drop-shadow filter format

**Validates: Requirements 2.1, 2.2, 8.4**

### Property 2: Light Mode Consistency

*For any* new theme in the added set (themes after 'lavender' in THEME_PRESETS), the mode property SHALL equal 'light'.

**Validates: Requirements 1.2**

### Property 3: Identity Format Validation

*For any* new theme, the id SHALL match kebab-case format (lowercase letters, numbers, and hyphens only), the label SHALL be a non-empty string, and the emoji SHALL be a non-empty string.

**Validates: Requirements 1.5**

### Property 4: Primary Text Contrast

*For any* new theme, the contrast ratio between primaryLight and the lightest color in cardBg SHALL meet or exceed WCAG AA standards (4.5:1 for normal text), ensuring body text readability on light backgrounds.

**Validates: Requirements 3.4, 7.1, 7.2**

### Property 5: Secondary Text Contrast

*For any* new theme, the contrast ratio between primaryDim and the lightest color in cardBg SHALL meet or exceed WCAG standards for large text (3:1), ensuring labels and secondary text remain readable.

**Validates: Requirements 7.3**

### Property 6: Unique Primary Hues

*For any* two themes in the complete THEME_PRESETS array (including existing and new themes), their primary color hues SHALL differ by at least 15 degrees in HSL color space, ensuring visual distinctiveness.

**Validates: Requirements 6.1**

### Property 7: Unique Emoji Identifiers

*For any* two themes in the complete THEME_PRESETS array, their emoji values SHALL be different, ensuring each theme has a unique visual identifier.

**Validates: Requirements 6.2**

## Error Handling

### Validation Errors

**Theme Structure Validation**:
- **Missing Properties**: If a theme is missing any of the 14 required properties, TypeScript compilation will fail
- **Invalid Formats**: Runtime validation should warn if color formats don't match expected patterns
- **Handling**: Development-time errors, caught during implementation

**Contrast Validation**:
- **Insufficient Contrast**: If contrast ratios fall below WCAG AA thresholds
- **Detection**: Automated testing during development
- **Handling**: Adjust primaryLight or primaryDim colors to meet standards

**Uniqueness Validation**:
- **Duplicate Hues**: If two themes have primary colors with hues within 15 degrees
- **Duplicate Emojis**: If two themes share the same emoji
- **Detection**: Automated testing during development
- **Handling**: Adjust colors or emojis to ensure uniqueness

### Runtime Considerations

**Theme Loading**:
- All themes are statically defined in types.ts
- No runtime loading errors expected
- TypeScript ensures type safety at compile time

**Card Rendering**:
- If a theme property is undefined, card layouts may render incorrectly
- **Mitigation**: TypeScript required properties prevent undefined values
- **Fallback**: Card components should handle missing values gracefully (though this shouldn't occur)

**Browser Compatibility**:
- CSS gradients and drop-shadow filters require modern browsers
- **Mitigation**: Target modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **Fallback**: Gradients degrade to solid colors in older browsers

## Testing Strategy

### Testing Approach

This feature uses a **dual testing approach**:

1. **Property-Based Tests**: Validate universal properties across all themes
2. **Example-Based Tests**: Verify specific requirements and visual quality

Property-based testing is appropriate here because:
- Themes are data structures with universal validation rules
- Properties should hold for all themes (existing + new)
- Input space is finite but large enough to benefit from generative testing
- Structural and format validation are universal properties

### Property-Based Tests

**Test Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Test Suite Structure**:

```typescript
// Test file: src/components/waiting-cards/__tests__/theme-properties.test.ts

import fc from 'fast-check';
import { THEME_PRESETS } from '../types';

describe('Theme Correctness Properties', () => {
  // Property 1: Complete Theme Structure
  test('Property 1: All themes have complete structure with valid formats', () => {
    // Feature: additional-waiting-card-designs, Property 1
    fc.assert(
      fc.property(fc.constantFrom(...THEME_PRESETS), (theme) => {
        // Verify all 14 properties exist
        expect(theme.id).toBeDefined();
        expect(theme.label).toBeDefined();
        // ... all 14 properties
        
        // Verify formats
        expect(theme.pageBg).toMatch(/^bg-/);
        expect(theme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        // ... format validations
      }),
      { numRuns: 100 }
    );
  });

  // Property 2: Light Mode Consistency
  test('Property 2: New themes are light mode', () => {
    // Feature: additional-waiting-card-designs, Property 2
    const newThemes = THEME_PRESETS.slice(15); // After 'lavender'
    fc.assert(
      fc.property(fc.constantFrom(...newThemes), (theme) => {
        expect(theme.mode).toBe('light');
      }),
      { numRuns: 100 }
    );
  });

  // Property 3: Identity Format Validation
  test('Property 3: Theme identities have valid formats', () => {
    // Feature: additional-waiting-card-designs, Property 3
    fc.assert(
      fc.property(fc.constantFrom(...THEME_PRESETS), (theme) => {
        expect(theme.id).toMatch(/^[a-z0-9-]+$/);
        expect(theme.label).toBeTruthy();
        expect(theme.emoji).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  // Property 4: Primary Text Contrast
  test('Property 4: Primary text meets WCAG AA contrast', () => {
    // Feature: additional-waiting-card-designs, Property 4
    const newThemes = THEME_PRESETS.slice(15);
    fc.assert(
      fc.property(fc.constantFrom(...newThemes), (theme) => {
        const contrast = calculateContrast(theme.primaryLight, extractBgColor(theme.cardBg));
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 }
    );
  });

  // Property 5: Secondary Text Contrast
  test('Property 5: Secondary text meets WCAG contrast', () => {
    // Feature: additional-waiting-card-designs, Property 5
    const newThemes = THEME_PRESETS.slice(15);
    fc.assert(
      fc.property(fc.constantFrom(...newThemes), (theme) => {
        const contrast = calculateContrast(theme.primaryDim, extractBgColor(theme.cardBg));
        expect(contrast).toBeGreaterThanOrEqual(3.0);
      }),
      { numRuns: 100 }
    );
  });

  // Property 6: Unique Primary Hues
  test('Property 6: All themes have unique primary hues', () => {
    // Feature: additional-waiting-card-designs, Property 6
    fc.assert(
      fc.property(
        fc.constantFrom(...THEME_PRESETS),
        fc.constantFrom(...THEME_PRESETS),
        (theme1, theme2) => {
          if (theme1.id === theme2.id) return true; // Same theme
          const hue1 = hexToHSL(theme1.primary).h;
          const hue2 = hexToHSL(theme2.primary).h;
          const hueDiff = Math.min(
            Math.abs(hue1 - hue2),
            360 - Math.abs(hue1 - hue2)
          );
          expect(hueDiff).toBeGreaterThanOrEqual(15);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 7: Unique Emoji Identifiers
  test('Property 7: All themes have unique emojis', () => {
    // Feature: additional-waiting-card-designs, Property 7
    fc.assert(
      fc.property(
        fc.constantFrom(...THEME_PRESETS),
        fc.constantFrom(...THEME_PRESETS),
        (theme1, theme2) => {
          if (theme1.id === theme2.id) return true; // Same theme
          expect(theme1.emoji).not.toBe(theme2.emoji);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Example-Based Unit Tests

**Test Suite Structure**:

```typescript
// Test file: src/components/waiting-cards/__tests__/new-themes.test.ts

describe('New Theme Requirements', () => {
  test('Exactly 10 new themes added', () => {
    const lightThemes = THEME_PRESETS.filter(t => t.mode === 'light');
    expect(lightThemes.length).toBe(15); // 5 existing + 10 new
  });

  test('At least 3 pastel themes', () => {
    const pastelThemes = ['mint-cream', 'rose-quartz', 'sky-whisper'];
    pastelThemes.forEach(id => {
      expect(THEME_PRESETS.find(t => t.id === id)).toBeDefined();
    });
  });

  test('At least 2 watercolor themes', () => {
    const watercolorThemes = ['coral-reef', 'sunset-bloom'];
    watercolorThemes.forEach(id => {
      expect(THEME_PRESETS.find(t => t.id === id)).toBeDefined();
    });
  });

  test('At least 3 nature-inspired themes', () => {
    const natureThemes = ['sage-garden', 'terracotta-clay', 'cherry-blossom', 'ocean-foam', 'honey-glow'];
    expect(natureThemes.length).toBeGreaterThanOrEqual(3);
    natureThemes.forEach(id => {
      expect(THEME_PRESETS.find(t => t.id === id)).toBeDefined();
    });
  });

  test('New themes positioned after lavender', () => {
    const lavenderIndex = THEME_PRESETS.findIndex(t => t.id === 'lavender');
    const newThemeIds = ['mint-cream', 'rose-quartz', 'sky-whisper', 'coral-reef', 'sunset-bloom',
                         'sage-garden', 'terracotta-clay', 'cherry-blossom', 'ocean-foam', 'honey-glow'];
    
    newThemeIds.forEach(id => {
      const themeIndex = THEME_PRESETS.findIndex(t => t.id === id);
      expect(themeIndex).toBeGreaterThan(lavenderIndex);
    });
  });

  test('Watercolor themes have multi-color gradients', () => {
    const coralReef = THEME_PRESETS.find(t => t.id === 'coral-reef');
    const sunsetBloom = THEME_PRESETS.find(t => t.id === 'sunset-bloom');
    
    // Verify gradients have multiple color stops
    expect(coralReef?.cardBg).toContain('gradient');
    expect(sunsetBloom?.cardBg).toContain('gradient');
    
    // Count color stops (rough heuristic: count hex colors or color names)
    const coralColors = (coralReef?.cardBg.match(/#[0-9a-fA-F]{6}/g) || []).length;
    const sunsetColors = (sunsetBloom?.cardBg.match(/#[0-9a-fA-F]{6}/g) || []).length;
    
    expect(coralColors).toBeGreaterThanOrEqual(2);
    expect(sunsetColors).toBeGreaterThanOrEqual(2);
  });

  test('Labels are not generic', () => {
    const newThemes = THEME_PRESETS.slice(15);
    newThemes.forEach(theme => {
      expect(theme.label).not.toMatch(/Light Theme \d+/);
      expect(theme.label).not.toMatch(/Theme \d+/);
    });
  });
});
```

### Integration Tests

**Visual Rendering Tests**:
- Render each new theme in all 6 card layouts
- Verify no console errors or warnings
- Visual inspection for professional appearance
- Screenshot comparison tests (optional)

**Browser Compatibility Tests**:
- Test in Chrome, Firefox, Safari, Edge (last 2 versions)
- Verify gradients render correctly
- Verify drop-shadow effects work

### Test Utilities

**Helper Functions**:

```typescript
// Color contrast calculation (WCAG formula)
function calculateContrast(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Extract background color from gradient
function extractBgColor(cardBg: string): string {
  // Extract lightest color from gradient or return solid color
  if (cardBg.includes('gradient')) {
    const colors = cardBg.match(/#[0-9a-fA-F]{6}/g) || [];
    // Return lightest color (highest luminance)
    return colors.reduce((lightest, color) => 
      getRelativeLuminance(color) > getRelativeLuminance(lightest) ? color : lightest
    );
  }
  return cardBg;
}

// Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Implementation of hex to HSL conversion
  // Returns hue (0-360), saturation (0-100), lightness (0-100)
}

// Get relative luminance (WCAG formula)
function getRelativeLuminance(color: string): number {
  // Implementation of WCAG relative luminance calculation
}
```

### Testing Workflow

1. **Development**: Run property-based tests during theme implementation
2. **Pre-commit**: Run all unit tests and property tests
3. **CI/CD**: Run full test suite including integration tests
4. **Manual QA**: Visual inspection of all themes in all layouts
5. **Accessibility**: Verify contrast ratios with automated tools (e.g., axe-core)

### Test Coverage Goals

- **Property Tests**: 100% of new themes tested against all 7 properties
- **Unit Tests**: 100% of specific requirements validated
- **Integration Tests**: All 10 themes × 6 layouts = 60 combinations tested
- **Accessibility**: All themes meet WCAG AA standards

## Implementation Plan

### Phase 1: Theme Definition
1. Add 10 new theme objects to `THEME_PRESETS` array in `src/components/waiting-cards/types.ts`
2. Position new themes after existing 'lavender' theme
3. Verify TypeScript compilation succeeds

### Phase 2: Testing Setup
1. Install fast-check: `npm install --save-dev fast-check`
2. Create test utilities for color contrast and HSL conversion
3. Set up test files:
   - `src/components/waiting-cards/__tests__/theme-properties.test.ts`
   - `src/components/waiting-cards/__tests__/new-themes.test.ts`

### Phase 3: Property-Based Testing
1. Implement 7 property-based tests
2. Run tests with 100 iterations each
3. Fix any failing themes (adjust colors for contrast, uniqueness)

### Phase 4: Example-Based Testing
1. Implement unit tests for specific requirements
2. Verify theme counts, categories, positioning
3. Validate watercolor gradient complexity

### Phase 5: Integration Testing
1. Manually test each theme in all 6 card layouts
2. Visual inspection for professional appearance
3. Browser compatibility testing
4. Accessibility audit with axe-core or similar tool

### Phase 6: Documentation
1. Update README or documentation with new theme options
2. Add screenshots of new themes (optional)
3. Document theme selection guidance for users

## Dependencies

### External Dependencies
- **fast-check**: Property-based testing library
- **vitest** (existing): Test runner
- **@testing-library/react** (existing): Component testing utilities

### Internal Dependencies
- `src/components/waiting-cards/types.ts`: Theme definitions
- All 6 card layout components: Must work with new themes without modification
- Theme selector UI: Will automatically include new themes

### No Breaking Changes
- Existing themes remain unchanged
- Existing card layouts require no modifications
- Theme selector UI requires no changes (dynamically reads THEME_PRESETS)

## Accessibility Considerations

### WCAG AA Compliance
- All themes maintain 4.5:1 contrast ratio for normal text (primaryLight on cardBg)
- Secondary text maintains 3:1 contrast ratio (primaryDim on cardBg)
- Large text (queue numbers) has enhanced contrast through gradients and glow effects

### Color Blindness
- Themes rely on lightness/darkness contrast, not just hue
- Multiple visual cues beyond color (text, layout, structure)
- Emoji identifiers provide additional non-color differentiation

### Screen Readers
- Themes are purely visual; no impact on screen reader functionality
- All text content remains accessible regardless of theme

## Performance Considerations

### Bundle Size
- 10 new theme objects add approximately 2-3 KB to bundle (minified)
- Negligible impact on load time
- No additional runtime overhead

### Rendering Performance
- CSS gradients are GPU-accelerated in modern browsers
- Drop-shadow filters have minimal performance impact
- No JavaScript calculations required for theme rendering

### Memory Usage
- Themes are static objects loaded once
- No dynamic theme generation or manipulation
- Minimal memory footprint

## Future Enhancements

### Potential Additions
1. **Dark Mode Variants**: Create dark mode versions of new themes
2. **Custom Theme Builder**: Allow users to create custom themes via UI
3. **Theme Preview**: Enhanced preview mode showing all layouts side-by-side
4. **Seasonal Themes**: Add holiday or seasonal theme variations
5. **Animation Themes**: Themes with animated gradients or effects

### Extensibility
- Theme system is designed for easy addition of new themes
- No architectural changes needed for future themes
- Property-based tests will automatically validate new themes

## Conclusion

This design specifies 10 distinctive light-themed color presets that expand the queue management system's theme library. The themes are carefully crafted to provide visual variety across pastel, watercolor, and nature-inspired aesthetics while maintaining professional quality and accessibility standards.

The dual testing approach (property-based + example-based) ensures comprehensive validation of both universal properties and specific requirements. All themes integrate seamlessly with existing card layouts without requiring any modifications to the component architecture.

