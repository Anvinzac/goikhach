# Implementation Plan: Additional Waiting Card Color Themes

## Overview

This implementation adds 10 new light-themed color presets to the queue management system's waiting card theme library. The themes are organized into three categories: pastel (3), watercolor (2), and nature-inspired (5). Each theme defines 14 color tokens that work seamlessly across all 6 existing card layouts.

**Implementation Scope:**
- Single file modification: `src/components/waiting-cards/types.ts`
- Add 10 theme objects to `THEME_PRESETS` array
- Set up property-based testing with fast-check
- Validate themes against 7 correctness properties

## Tasks

- [x] 1. Set up testing infrastructure
  - Install fast-check library for property-based testing
  - Create test utility functions for color contrast and HSL conversion
  - Set up test file structure
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. Implement pastel-inspired themes
  - [x] 2.1 Add Mint Cream theme (🌿)
    - Add complete ThemeColors object with all 14 properties
    - Use soft mint green palette (#10b981 primary)
    - Position after 'lavender' theme in THEME_PRESETS array
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.2 Add Rose Quartz theme (🌹)
    - Add complete ThemeColors object with all 14 properties
    - Use dusty rose palette (#ec4899 primary)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.3 Add Sky Whisper theme (☁️)
    - Add complete ThemeColors object with all 14 properties
    - Use soft powder blue palette (#3b82f6 primary)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Implement watercolor-inspired themes
  - [x] 3.1 Add Coral Reef theme (🪸)
    - Add complete ThemeColors object with all 14 properties
    - Use multi-color gradient blending coral pink, turquoise, and peach
    - Implement fluid color transitions in cardBg gradient
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 3.2 Add Sunset Bloom theme (🌺)
    - Add complete ThemeColors object with all 14 properties
    - Use multi-color gradient blending warm pink, golden yellow, and soft orange
    - Implement fluid color transitions in cardBg gradient
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implement nature-inspired themes (botanical and earth tones)
  - [x] 4.1 Add Sage Garden theme (🌿)
    - Add complete ThemeColors object with all 14 properties
    - Use muted sage green palette (#84cc16 primary)
    - Evoke herb garden aesthetic
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 4.2 Add Terracotta Clay theme (🏺)
    - Add complete ThemeColors object with all 14 properties
    - Use warm terracotta/rust palette (#ea580c primary)
    - Evoke Mediterranean clay pottery aesthetic
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implement nature-inspired themes (floral and aquatic)
  - [x] 5.1 Add Cherry Blossom theme (🌸)
    - Add complete ThemeColors object with all 14 properties
    - Use soft pink with warm undertones (#f472b6 primary)
    - Evoke spring cherry blossom aesthetic
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.2 Add Ocean Foam theme (🌊)
    - Add complete ThemeColors object with all 14 properties
    - Use soft teal/cyan palette (#22d3ee primary)
    - Evoke coastal sea foam aesthetic
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.3 Add Honey Glow theme (🍯)
    - Add complete ThemeColors object with all 14 properties
    - Use warm golden yellow palette (#fbbf24 primary)
    - Evoke natural honey and warm sunlight aesthetic
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Checkpoint - Verify theme implementation
  - Ensure all 10 themes are added to THEME_PRESETS array
  - Verify TypeScript compilation succeeds with no errors
  - Confirm themes are positioned after 'lavender' theme
  - Ask the user if questions arise

- [x] 7. Implement property-based test utilities
  - [x] 7.1 Create color contrast calculation utility
    - Implement WCAG relative luminance calculation
    - Implement contrast ratio calculation (WCAG formula)
    - Create function to extract background color from gradients
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 7.2 Create color conversion utilities
    - Implement hex to HSL conversion function
    - Implement hex to RGB conversion function
    - Create hue difference calculation for circular color space
    - _Requirements: 6.1_

- [x] 8. Write property-based tests for theme validation
  - [x] 8.1 Write property test for complete theme structure (Property 1)
    - **Property 1: Complete Theme Structure**
    - **Validates: Requirements 2.1, 2.2, 8.4**
    - Test that all themes have 14 required properties with valid formats
    - Verify pageBg uses Tailwind class format, primary/primaryLight use hex format
    - Use fast-check with 100 iterations
  
  - [x] 8.2 Write property test for light mode consistency (Property 2)
    - **Property 2: Light Mode Consistency**
    - **Validates: Requirements 1.2**
    - Test that all new themes (after 'lavender') have mode: 'light'
    - Use fast-check with 100 iterations
  
  - [x] 8.3 Write property test for identity format validation (Property 3)
    - **Property 3: Identity Format Validation**
    - **Validates: Requirements 1.5**
    - Test that id matches kebab-case format, label and emoji are non-empty
    - Use fast-check with 100 iterations
  
  - [x] 8.4 Write property test for primary text contrast (Property 4)
    - **Property 4: Primary Text Contrast**
    - **Validates: Requirements 3.4, 7.1, 7.2**
    - Test that primaryLight meets WCAG AA contrast (4.5:1) against cardBg
    - Use fast-check with 100 iterations
  
  - [x] 8.5 Write property test for secondary text contrast (Property 5)
    - **Property 5: Secondary Text Contrast**
    - **Validates: Requirements 7.3**
    - Test that primaryDim meets WCAG contrast (3:1) against cardBg
    - Use fast-check with 100 iterations
  
  - [x] 8.6 Write property test for unique primary hues (Property 6)
    - **Property 6: Unique Primary Hues**
    - **Validates: Requirements 6.1**
    - Test that all themes have primary colors with hues differing by at least 15 degrees
    - Use fast-check with 100 iterations
  
  - [x] 8.7 Write property test for unique emoji identifiers (Property 7)
    - **Property 7: Unique Emoji Identifiers**
    - **Validates: Requirements 6.2**
    - Test that all themes have unique emoji values
    - Use fast-check with 100 iterations

- [x] 9. Write example-based unit tests
  - [x] 9.1 Write unit test for theme count validation
    - Test that exactly 10 new themes were added
    - Verify total light themes count is 15 (5 existing + 10 new)
    - _Requirements: 1.1_
  
  - [x] 9.2 Write unit test for category distribution
    - Test that at least 3 pastel themes exist
    - Test that at least 2 watercolor themes exist
    - Test that at least 3 nature-inspired themes exist
    - _Requirements: 1.3, 3.1, 4.1, 5.1_
  
  - [x] 9.3 Write unit test for theme positioning
    - Test that all new themes are positioned after 'lavender' in array
    - _Requirements: 8.3_
  
  - [x] 9.4 Write unit test for watercolor gradient complexity
    - Test that watercolor themes (Coral Reef, Sunset Bloom) have multi-color gradients
    - Verify cardBg contains gradient syntax with multiple color stops
    - _Requirements: 4.3_
  
  - [x] 9.5 Write unit test for non-generic labels
    - Test that no theme labels match generic patterns like "Light Theme 1"
    - Verify all labels are descriptive and evocative
    - _Requirements: 6.3_
  
  - [x] 9.6 Write unit test for visual distinctiveness
    - Test that all new themes have unique id values
    - Verify no duplicate theme identifiers exist
    - _Requirements: 1.4, 6.1, 6.4_

- [x] 10. Checkpoint - Ensure all tests pass
  - Run all property-based tests and verify they pass
  - Run all example-based unit tests and verify they pass
  - Fix any failing tests by adjusting theme color values
  - Ensure all tests pass, ask the user if questions arise

- [x] 11. Integration validation
  - [x] 11.1 Write integration test for theme compatibility
    - Test that all new themes work with existing card layout components
    - Verify no console errors when rendering themes
    - Test theme selector UI includes all new themes
    - _Requirements: 8.5_
  
  - [x] 11.2 Manual visual inspection
    - Manually test each new theme in all 6 card layouts
    - Verify professional appearance and readability
    - Check that gradients render correctly in browser
    - _Requirements: 6.4, 7.4, 7.5, 7.6_

- [x] 12. Final checkpoint - Complete validation
  - Verify all 10 themes are implemented correctly
  - Confirm all property-based tests pass (7 properties × 100 iterations)
  - Confirm all unit tests pass
  - Ensure TypeScript compilation succeeds
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each theme implementation task includes all 14 required color token properties
- Property-based tests use fast-check library with minimum 100 iterations per property
- All themes maintain WCAG AA contrast ratios for accessibility
- Themes are positioned after existing 'lavender' theme in THEME_PRESETS array
- No modifications required to card layout components or theme selector UI
- Testing validates both universal properties (property-based) and specific requirements (example-based)
