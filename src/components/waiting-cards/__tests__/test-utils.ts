/**
 * Test utility functions for theme validation
 * Provides color contrast calculation and color conversion utilities
 */

/**
 * Convert hex color to RGB
 */
export function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Convert hex color to HSL
 * Returns hue (0-360), saturation (0-100), lightness (0-100)
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRGB(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Get relative luminance according to WCAG formula
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getRelativeLuminance(color: string): number {
  const { r, g, b } = hexToRGB(color);

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors according to WCAG formula
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function calculateContrast(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract background color from gradient or return solid color
 * For gradients, returns the lightest color (highest luminance)
 */
export function extractBgColor(cardBg: string): string {
  if (cardBg.includes('gradient')) {
    const colors = cardBg.match(/#[0-9a-fA-F]{6}/g) || [];
    if (colors.length === 0) {
      // Fallback to white if no hex colors found
      return '#ffffff';
    }
    // Return lightest color (highest luminance)
    return colors.reduce((lightest, color) =>
      getRelativeLuminance(color) > getRelativeLuminance(lightest) ? color : lightest
    );
  }
  // If it's a solid color, try to extract hex
  const hexMatch = cardBg.match(/#[0-9a-fA-F]{6}/);
  return hexMatch ? hexMatch[0] : '#ffffff';
}

/**
 * Calculate the minimum hue difference between two hues in circular color space
 * Hues are in degrees (0-360)
 */
export function calculateHueDifference(hue1: number, hue2: number): number {
  const diff = Math.abs(hue1 - hue2);
  return Math.min(diff, 360 - diff);
}

/**
 * Parse rgba color string to extract opacity
 */
export function parseRGBA(rgba: string): { r: number; g: number; b: number; a: number } | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}
