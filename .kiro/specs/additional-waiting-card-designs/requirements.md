# Requirements Document

## Introduction

This document specifies requirements for adding 10 new light-themed color presets to the queue management system's theme library. The system currently has 15 theme presets (10 dark, 5 light) that work across 6 card layouts. The new light themes must be distinctive, non-generic, and maintain the existing quality bar with unique aesthetics including pastel colors, watercolor-inspired palettes, and nature-inspired color schemes. Each theme must have a distinct visual identity while maintaining professional polish and readability.

## Glossary

- **Theme_Preset**: A ThemeColors object defining a complete color palette for the card system
- **Light_Mode_Theme**: A theme with mode: 'light', designed for bright backgrounds with dark text
- **Color_Token**: Individual color properties in ThemeColors (primary, primaryLight, primaryDim, etc.)
- **Theme_Identity**: The unique visual character of a theme (pastel, watercolor, nature-inspired, etc.)
- **THEME_PRESETS**: The exported array in types.ts containing all available themes
- **Card_Layout**: The 6 existing card components that consume theme presets
- **Readability_Contrast**: Sufficient color contrast between text and backgrounds for accessibility

## Requirements

### Requirement 1: Ten Unique Light Theme Presets

**User Story:** As a restaurant owner, I want 10 distinctive light-themed color palettes, so that I can choose a theme that perfectly matches my brand's aesthetic and stands out from generic designs.

#### Acceptance Criteria

1. THE system SHALL add exactly 10 new Theme_Preset objects to THEME_PRESETS array
2. EACH Theme_Preset SHALL have mode: 'light'
3. EACH Theme_Preset SHALL have a unique Theme_Identity from the following categories:
   - Pastel-inspired themes (soft, muted colors)
   - Watercolor-inspired themes (fluid, artistic color blends)
   - Nature-inspired themes (botanical, earth tones, natural elements)
4. NO two themes SHALL use similar color palettes or visual identities
5. EACH Theme_Preset SHALL have a descriptive id (kebab-case), label (display name), and emoji that reflects its identity
6. THE new themes SHALL be visually distinct from existing 5 light themes (paper, frost, matcha, peach, lavender)

### Requirement 2: Complete Color Token Implementation

**User Story:** As a developer, I want each theme to define all required color tokens, so that the themes work correctly across all 6 card layouts.

#### Acceptance Criteria

1. EACH Theme_Preset SHALL define all 14 required Color_Token properties:
   - id: string (unique identifier)
   - label: string (display name)
   - emoji: string (visual identifier)
   - mode: 'light'
   - pageBg: string (Tailwind class for page background)
   - cardBg: string (CSS value for card background, can be gradient)
   - cardBorder: string (rgba color for card border)
   - primary: string (main accent color)
   - primaryLight: string (darker variant for light mode text)
   - primaryDim: string (semi-transparent for labels)
   - primaryFaint: string (very subtle for backgrounds)
   - surface: string (tile/container background)
   - surfaceBorder: string (tile/container border)
   - glow: string (shadow and effect color)
   - numberGradient: string (CSS gradient for queue number)
   - numberGlow: string (drop-shadow filter for queue number)
2. THE Color_Token values SHALL use appropriate formats (Tailwind classes for pageBg, CSS values for others)
3. THE primary color SHALL be the theme's signature color that defines its identity

### Requirement 3: Pastel Color Themes

**User Story:** As a restaurant owner with a soft, gentle brand aesthetic, I want pastel-themed color palettes, so that my waiting cards feel calm and approachable.

#### Acceptance Criteria

1. THE system SHALL include at least 3 pastel-inspired Theme_Preset objects
2. EACH pastel theme SHALL use soft, desaturated colors with high lightness values
3. PASTEL themes SHALL include varied color families (e.g., mint, rose, sky, butter, lilac)
4. EACH pastel theme SHALL maintain sufficient Readability_Contrast despite soft colors
5. PASTEL themes SHALL use subtle gradients in cardBg to add depth without harshness

### Requirement 4: Watercolor-Inspired Themes

**User Story:** As a restaurant owner with an artistic, creative brand, I want watercolor-inspired themes, so that my waiting cards have a unique, hand-crafted feel.

#### Acceptance Criteria

1. THE system SHALL include at least 2 watercolor-inspired Theme_Preset objects
2. WATERCOLOR themes SHALL use fluid color transitions in cardBg gradients
3. WATERCOLOR themes SHALL incorporate multiple harmonious colors (2-3 colors blending)
4. THE glow property SHALL create soft, diffused effects reminiscent of watercolor bleeds
5. WATERCOLOR themes SHALL avoid harsh edges, using gentle opacity transitions

### Requirement 5: Nature-Inspired Themes

**User Story:** As a restaurant owner with an organic, natural brand, I want nature-inspired themes, so that my waiting cards reflect earth tones and botanical aesthetics.

#### Acceptance Criteria

1. THE system SHALL include at least 3 nature-inspired Theme_Preset objects
2. NATURE themes SHALL draw from natural color palettes:
   - Botanical (sage, moss, fern, leaf greens)
   - Earth tones (terracotta, clay, sand, stone)
   - Floral (cherry blossom, sunflower, lavender fields)
   - Sky/water (dawn, dusk, ocean foam, cloud)
3. EACH nature theme SHALL have a clear natural inspiration reflected in its id, label, and emoji
4. NATURE themes SHALL use organic color combinations found in nature
5. THE cardBg gradients SHALL evoke natural lighting (sunrise, sunset, forest canopy, etc.)

### Requirement 6: Visual Distinctiveness

**User Story:** As a restaurant owner browsing themes, I want each theme to look clearly different from others, so that I can easily identify and choose the perfect one for my brand.

#### Acceptance Criteria

1. NO two Theme_Preset objects SHALL use the same primary color hue
2. EACH theme SHALL have a unique emoji that visually represents its identity
3. THE label SHALL be descriptive and evocative (not generic like "Light Theme 1")
4. WHEN viewed side-by-side, themes SHALL be immediately distinguishable by color palette
5. THE system SHALL avoid creating themes that are minor variations of existing themes

### Requirement 7: Professional Quality and Readability

**User Story:** As a customer viewing my queue status, I want the text to be clearly readable, so that I can understand my waiting information regardless of which theme is selected.

#### Acceptance Criteria

1. EACH Theme_Preset SHALL maintain WCAG AA contrast ratios for text readability
2. THE primaryLight color SHALL be dark enough for body text on light backgrounds
3. THE primaryDim color SHALL be readable for labels and secondary text
4. THE numberGradient SHALL ensure queue numbers are prominent and legible
5. THE cardBg SHALL not interfere with text readability through excessive patterns or contrast
6. EACH theme SHALL be tested visually to ensure professional appearance

### Requirement 8: Consistent Theme Structure

**User Story:** As a developer maintaining the theme system, I want all themes to follow the same structure, so that they work reliably across all card layouts.

#### Acceptance Criteria

1. EACH Theme_Preset SHALL follow the exact TypeScript structure defined by ThemeColors type
2. THE new themes SHALL be added to the THEME_PRESETS array in types.ts
3. THE themes SHALL be positioned after existing light themes in the array
4. EACH theme SHALL use consistent color value formats matching existing themes:
   - Tailwind classes for pageBg (e.g., 'bg-[#f5f0e8]')
   - CSS gradients for cardBg where appropriate
   - rgba() format for transparent colors
   - Hex or named colors for solid colors
5. THE themes SHALL work correctly with all 6 existing Card_Layout components without modification
