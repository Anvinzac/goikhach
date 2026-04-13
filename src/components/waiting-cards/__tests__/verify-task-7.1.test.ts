/**
 * Verification test for Task 7.1: Color contrast calculation utility
 * This test verifies that the utilities in test-utils.ts are correctly implemented
 */

import { describe, test, expect } from 'vitest';
import {
  hexToRGB,
  hexToHSL,
  getRelativeLuminance,
  calculateContrast,
  extractBgColor,
  calculateHueDifference,
} from './test-utils';

describe('Task 7.1: Color Contrast Calculation Utility', () => {
  describe('WCAG Relative Luminance Calculation', () => {
    test('should calculate correct luminance for pure white', () => {
      const luminance = getRelativeLuminance('#ffffff');
      expect(luminance).toBeCloseTo(1.0, 2);
    });

    test('should calculate correct luminance for pure black', () => {
      const luminance = getRelativeLuminance('#000000');
      expect(luminance).toBeCloseTo(0.0, 2);
    });

    test('should calculate correct luminance for red', () => {
      const luminance = getRelativeLuminance('#ff0000');
      // Red has luminance of approximately 0.2126
      expect(luminance).toBeCloseTo(0.2126, 3);
    });

    test('should calculate correct luminance for green', () => {
      const luminance = getRelativeLuminance('#00ff00');
      // Green has luminance of approximately 0.7152
      expect(luminance).toBeCloseTo(0.7152, 3);
    });

    test('should calculate correct luminance for blue', () => {
      const luminance = getRelativeLuminance('#0000ff');
      // Blue has luminance of approximately 0.0722
      expect(luminance).toBeCloseTo(0.0722, 3);
    });
  });

  describe('Contrast Ratio Calculation (WCAG Formula)', () => {
    test('should calculate 21:1 contrast for black on white', () => {
      const contrast = calculateContrast('#000000', '#ffffff');
      expect(contrast).toBeCloseTo(21, 1);
    });

    test('should calculate 1:1 contrast for identical colors', () => {
      const contrast = calculateContrast('#ff0000', '#ff0000');
      expect(contrast).toBeCloseTo(1, 1);
    });

    test('should calculate correct contrast for typical text colors', () => {
      // Dark gray (#333333) on white should have good contrast
      const contrast = calculateContrast('#333333', '#ffffff');
      expect(contrast).toBeGreaterThan(4.5); // WCAG AA minimum
    });

    test('should be symmetric (order should not matter)', () => {
      const contrast1 = calculateContrast('#000000', '#ffffff');
      const contrast2 = calculateContrast('#ffffff', '#000000');
      expect(contrast1).toBeCloseTo(contrast2, 2);
    });
  });

  describe('Extract Background Color from Gradients', () => {
    test('should extract lightest color from gradient', () => {
      const gradient = 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)';
      const bgColor = extractBgColor(gradient);
      
      // Should return one of the colors from the gradient
      expect(bgColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      
      // Should be one of the gradient colors
      const colors = ['#f0fdf4', '#ecfdf5'];
      expect(colors).toContain(bgColor);
    });

    test('should return solid color when no gradient', () => {
      const solidColor = '#ffffff';
      const bgColor = extractBgColor(solidColor);
      expect(bgColor).toBe('#ffffff');
    });

    test('should handle complex multi-color gradients', () => {
      const gradient = 'linear-gradient(135deg, #fef2f2 0%, #fce7f3 30%, #ecfeff 70%, #fef2f2 100%)';
      const bgColor = extractBgColor(gradient);
      
      // Should extract a valid hex color
      expect(bgColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      
      // Should be the lightest color (highest luminance)
      const colors = ['#fef2f2', '#fce7f3', '#ecfeff'];
      const luminances = colors.map(c => getRelativeLuminance(c));
      const maxLuminance = Math.max(...luminances);
      const extractedLuminance = getRelativeLuminance(bgColor);
      
      expect(extractedLuminance).toBeCloseTo(maxLuminance, 3);
    });

    test('should fallback to white if no colors found', () => {
      const invalidGradient = 'linear-gradient(to right, transparent, transparent)';
      const bgColor = extractBgColor(invalidGradient);
      expect(bgColor).toBe('#ffffff');
    });
  });

  describe('Integration: Real Theme Contrast Validation', () => {
    test('should validate Mint Cream theme contrast', () => {
      const primaryLight = '#065f46'; // Mint Cream primaryLight
      const cardBg = 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)';
      
      const bgColor = extractBgColor(cardBg);
      const contrast = calculateContrast(primaryLight, bgColor);
      
      // Should meet WCAG AA standard (4.5:1)
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    test('should validate Terracotta Clay theme contrast', () => {
      const primaryLight = '#7c2d12'; // Terracotta Clay primaryLight
      const cardBg = 'linear-gradient(160deg, #fffbf5 0%, #fff7ed 50%, #fffbf5 100%)';
      
      const bgColor = extractBgColor(cardBg);
      const contrast = calculateContrast(primaryLight, bgColor);
      
      // Should meet WCAG AA standard (4.5:1)
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    test('should validate Ocean Foam theme contrast', () => {
      const primaryLight = '#164e63'; // Ocean Foam primaryLight
      const cardBg = 'linear-gradient(145deg, #f0fdff 0%, #ecfeff 50%, #f0fdff 100%)';
      
      const bgColor = extractBgColor(cardBg);
      const contrast = calculateContrast(primaryLight, bgColor);
      
      // Should meet WCAG AA standard (4.5:1)
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Helper Functions', () => {
    test('hexToRGB should convert hex to RGB correctly', () => {
      const rgb = hexToRGB('#ff8800');
      expect(rgb).toEqual({ r: 255, g: 136, b: 0 });
    });

    test('hexToHSL should convert hex to HSL correctly', () => {
      const hsl = hexToHSL('#ff0000');
      expect(hsl.h).toBe(0); // Red is at 0 degrees
      expect(hsl.s).toBe(100); // Fully saturated
      expect(hsl.l).toBe(50); // Medium lightness
    });

    test('calculateHueDifference should handle circular color space', () => {
      // 10 degrees and 350 degrees are only 20 degrees apart
      const diff = calculateHueDifference(10, 350);
      expect(diff).toBe(20);
    });
  });
});
