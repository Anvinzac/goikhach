/**
 * Manual verification of Terracotta Clay theme contrast ratios
 */

// Helper functions
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function getRelativeLuminance(color: string): number {
  const { r, g, b } = hexToRGB(color);
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function calculateContrast(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Terracotta Clay theme colors
const primaryLight = '#7c2d12'; // Text color
const cardBgColors = ['#fffbf5', '#fff7ed']; // Gradient colors

// Find lightest background color
const lightestBg = cardBgColors.reduce((lightest, color) =>
  getRelativeLuminance(color) > getRelativeLuminance(lightest) ? color : lightest
);

console.log('Terracotta Clay Theme Contrast Verification');
console.log('===========================================');
console.log(`Primary Light (text): ${primaryLight}`);
console.log(`Lightest Background: ${lightestBg}`);
console.log('');

const contrast = calculateContrast(primaryLight, lightestBg);
console.log(`Contrast Ratio: ${contrast.toFixed(2)}:1`);
console.log(`WCAG AA (4.5:1): ${contrast >= 4.5 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`WCAG AAA (7:1): ${contrast >= 7.0 ? '✅ PASS' : '⚠️  Not required'}`);
