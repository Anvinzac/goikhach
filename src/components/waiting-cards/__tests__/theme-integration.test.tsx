/**
 * Integration Tests for Theme Compatibility
 * Feature: additional-waiting-card-designs
 * Task: 11.1 Write integration test for theme compatibility
 * 
 * **Validates: Requirements 8.5**
 * 
 * This test suite validates that all new themes work correctly with existing
 * card layout components and that the theme selector UI includes all new themes.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { THEME_PRESETS, type WaitingCardData } from '../types';
import ClassicCard from '../ClassicCard';
import TicketStrip from '../TicketStrip';
import RadialHub from '../RadialHub';
import SplitScreen from '../SplitScreen';
import CardStack from '../CardStack';
import TimelineJourney from '../TimelineJourney';

// Mock data for testing
const mockCardData: WaitingCardData = {
  queueNumber: 7,
  restaurantName: 'Test Restaurant',
  restaurantTagline: 'Test Tagline',
  partySize: 3,
  checkInTime: '14:30',
  checkInDate: 'Monday, 15/01',
  waitingDuration: '5\'',
  estimatedWait: '9\'',
  dailySpecial: 'Test special dish',
  peopleAhead: 3,
  peopleWaitingTotal: 12,
  status: 'waiting',
  language: 'EN',
};

// All card layout components
const CARD_LAYOUTS = [
  { name: 'ClassicCard', component: ClassicCard },
  { name: 'TicketStrip', component: TicketStrip },
  { name: 'RadialHub', component: RadialHub },
  { name: 'SplitScreen', component: SplitScreen },
  { name: 'CardStack', component: CardStack },
  { name: 'TimelineJourney', component: TimelineJourney },
];

// New themes added in this feature (after 'lavender')
const NEW_THEME_IDS = [
  'mint-cream',
  'rose-quartz',
  'sky-whisper',
  'coral-reef',
  'sunset-bloom',
  'sage-garden',
  'terracotta-clay',
  'cherry-blossom',
  'ocean-foam',
  'honey-glow',
];

describe('Theme Integration Tests', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console.error and console.warn to detect rendering issues
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('New themes work with all card layouts', () => {
    test('All 10 new themes render without errors in ClassicCard', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));
      expect(newThemes.length).toBe(10);

      newThemes.forEach((theme) => {
        const { unmount } = render(
          <ClassicCard data={mockCardData} theme={theme} />
        );

        // Verify no console errors or warnings
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        unmount();
      });
    });

    test('All 10 new themes render without errors in TicketStrip', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        const { unmount } = render(
          <TicketStrip data={mockCardData} theme={theme} />
        );

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        unmount();
      });
    });

    test('All 10 new themes render without errors in RadialHub', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        const { unmount } = render(
          <RadialHub data={mockCardData} theme={theme} />
        );

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        unmount();
      });
    });

    test('All 10 new themes render without errors in SplitScreen', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        const { unmount } = render(
          <SplitScreen data={mockCardData} theme={theme} />
        );

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        unmount();
      });
    });

    test('All 10 new themes render without errors in CardStack', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        const { unmount } = render(
          <CardStack data={mockCardData} theme={theme} />
        );

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        unmount();
      });
    });

    test('All 10 new themes render without errors in TimelineJourney', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        const { unmount } = render(
          <TimelineJourney data={mockCardData} theme={theme} />
        );

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        unmount();
      });
    });
  });

  describe('Theme compatibility across all layouts', () => {
    test('Each new theme works with all 6 card layouts', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        CARD_LAYOUTS.forEach((layout) => {
          const { unmount } = render(
            <layout.component data={mockCardData} theme={theme} />
          );

          // Verify no console errors or warnings
          expect(consoleErrorSpy).not.toHaveBeenCalled();
          expect(consoleWarnSpy).not.toHaveBeenCalled();

          unmount();
        });
      });
    });

    test('All themes have required properties for card rendering', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        // Verify all required properties exist and are non-empty
        expect(theme.id).toBeTruthy();
        expect(theme.label).toBeTruthy();
        expect(theme.emoji).toBeTruthy();
        expect(theme.mode).toBe('light');
        expect(theme.pageBg).toBeTruthy();
        expect(theme.cardBg).toBeTruthy();
        expect(theme.cardBorder).toBeTruthy();
        expect(theme.primary).toBeTruthy();
        expect(theme.primaryLight).toBeTruthy();
        expect(theme.primaryDim).toBeTruthy();
        expect(theme.primaryFaint).toBeTruthy();
        expect(theme.surface).toBeTruthy();
        expect(theme.surfaceBorder).toBeTruthy();
        expect(theme.glow).toBeTruthy();
        expect(theme.numberGradient).toBeTruthy();
        expect(theme.numberGlow).toBeTruthy();
      });
    });
  });

  describe('Theme selector UI includes all new themes', () => {
    test('THEME_PRESETS array includes all 10 new themes', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));
      expect(newThemes.length).toBe(10);

      // Verify each new theme is present
      NEW_THEME_IDS.forEach((themeId) => {
        const theme = THEME_PRESETS.find((t) => t.id === themeId);
        expect(theme).toBeDefined();
        expect(theme?.mode).toBe('light');
      });
    });

    test('New themes are positioned after lavender theme', () => {
      const lavenderIndex = THEME_PRESETS.findIndex((t) => t.id === 'lavender');
      expect(lavenderIndex).toBeGreaterThanOrEqual(0);

      NEW_THEME_IDS.forEach((themeId) => {
        const themeIndex = THEME_PRESETS.findIndex((t) => t.id === themeId);
        expect(themeIndex).toBeGreaterThan(lavenderIndex);
      });
    });

    test('All new themes have display-ready properties', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        // Verify label is descriptive (not generic)
        expect(theme.label).not.toMatch(/Light Theme \d+/);
        expect(theme.label).not.toMatch(/Theme \d+/);
        expect(theme.label.length).toBeGreaterThan(0);

        // Verify emoji is present
        expect(theme.emoji).toBeTruthy();
        expect(theme.emoji.length).toBeGreaterThan(0);

        // Verify id is kebab-case
        expect(theme.id).toMatch(/^[a-z0-9-]+$/);
      });
    });

    test('Total light themes count is 15 (5 existing + 10 new)', () => {
      const lightThemes = THEME_PRESETS.filter((t) => t.mode === 'light');
      expect(lightThemes.length).toBe(15);
    });
  });

  describe('No console errors during theme rendering', () => {
    test('Rendering all themes in all layouts produces no errors', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      // Test all combinations: 10 themes × 6 layouts = 60 combinations
      let renderCount = 0;

      newThemes.forEach((theme) => {
        CARD_LAYOUTS.forEach((layout) => {
          const { unmount } = render(
            <layout.component data={mockCardData} theme={theme} />
          );
          renderCount++;
          unmount();
        });
      });

      // Verify we tested all combinations
      expect(renderCount).toBe(60);

      // Verify no console errors or warnings occurred
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test('Themes with gradients render without errors', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));
      const themesWithGradients = newThemes.filter((t) => t.cardBg.includes('gradient'));

      // Verify we have themes with gradients
      expect(themesWithGradients.length).toBeGreaterThan(0);

      themesWithGradients.forEach((theme) => {
        const { unmount } = render(
          <ClassicCard data={mockCardData} theme={theme} />
        );

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        unmount();
      });
    });

    test('Themes render correctly with different card statuses', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));
      const statuses: Array<'waiting' | 'called' | 'cancelled' | 'expired'> = [
        'waiting',
        'called',
        'cancelled',
        'expired',
      ];

      newThemes.forEach((theme) => {
        statuses.forEach((status) => {
          const testData = { ...mockCardData, status };
          const { unmount } = render(
            <ClassicCard data={testData} theme={theme} />
          );

          expect(consoleErrorSpy).not.toHaveBeenCalled();
          expect(consoleWarnSpy).not.toHaveBeenCalled();

          unmount();
        });
      });
    });
  });

  describe('Theme visual properties are valid', () => {
    test('All new themes have valid CSS color values', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        // Test that color properties are defined and non-empty
        expect(theme.primary).toBeTruthy();
        expect(theme.primaryLight).toBeTruthy();
        expect(theme.cardBg).toBeTruthy();
        expect(theme.glow).toBeTruthy();

        // Test primary color format (hex)
        expect(theme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        
        // Test primaryLight color format (hex)
        expect(theme.primaryLight).toMatch(/^#[0-9a-fA-F]{6}$/);

        // Test cardBg contains either gradient or hex color
        const hasGradient = theme.cardBg.includes('gradient');
        const hasHexColor = /#[0-9a-fA-F]{6}/.test(theme.cardBg);
        expect(hasGradient || hasHexColor).toBe(true);

        // Test glow color format (rgba or hex)
        const isRgba = theme.glow.startsWith('rgba(');
        const isHex = /^#[0-9a-fA-F]{6}$/.test(theme.glow);
        expect(isRgba || isHex).toBe(true);
      });
    });

    test('All new themes have valid Tailwind pageBg classes', () => {
      const newThemes = THEME_PRESETS.filter((t) => NEW_THEME_IDS.includes(t.id));

      newThemes.forEach((theme) => {
        // Verify pageBg starts with 'bg-'
        expect(theme.pageBg).toMatch(/^bg-/);
      });
    });
  });
});
