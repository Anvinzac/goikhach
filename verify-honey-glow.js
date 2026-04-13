/**
 * Verification script for Honey Glow theme
 * Checks that the theme is properly added with all required properties
 */

import { THEME_PRESETS } from './src/components/waiting-cards/types.ts';

const honeyGlow = THEME_PRESETS.find(t => t.id === 'honey-glow');

console.log('=== Honey Glow Theme Verification ===\n');

if (!honeyGlow) {
  console.error('❌ FAILED: Honey Glow theme not found in THEME_PRESETS');
  process.exit(1);
}

console.log('✅ Theme found in THEME_PRESETS');

// Check all 14 required properties
const requiredProps = [
  'id', 'label', 'emoji', 'mode', 'pageBg', 'cardBg', 'cardBorder',
  'primary', 'primaryLight', 'primaryDim', 'primaryFaint',
  'surface', 'surfaceBorder', 'glow', 'numberGradient', 'numberGlow'
];

let allPropsPresent = true;
for (const prop of requiredProps) {
  if (honeyGlow[prop] === undefined) {
    console.error(`❌ Missing property: ${prop}`);
    allPropsPresent = false;
  }
}

if (allPropsPresent) {
  console.log('✅ All 14 required properties present');
}

// Verify specific values
const checks = [
  { name: 'ID', value: honeyGlow.id, expected: 'honey-glow' },
  { name: 'Label', value: honeyGlow.label, expected: 'Honey Glow' },
  { name: 'Emoji', value: honeyGlow.emoji, expected: '🍯' },
  { name: 'Mode', value: honeyGlow.mode, expected: 'light' },
  { name: 'Primary', value: honeyGlow.primary, expected: '#fbbf24' },
  { name: 'PrimaryLight', value: honeyGlow.primaryLight, expected: '#713f12' },
];

console.log('\n=== Property Values ===');
let allChecksPass = true;
for (const check of checks) {
  if (check.value === check.expected) {
    console.log(`✅ ${check.name}: ${check.value}`);
  } else {
    console.error(`❌ ${check.name}: Expected "${check.expected}", got "${check.value}"`);
    allChecksPass = false;
  }
}

// Check position (should be after ocean-foam)
const oceanFoamIndex = THEME_PRESETS.findIndex(t => t.id === 'ocean-foam');
const honeyGlowIndex = THEME_PRESETS.findIndex(t => t.id === 'honey-glow');

console.log('\n=== Position Check ===');
if (honeyGlowIndex === oceanFoamIndex + 1) {
  console.log(`✅ Honey Glow is positioned after Ocean Foam (index ${honeyGlowIndex})`);
} else {
  console.error(`❌ Honey Glow position incorrect. Expected index ${oceanFoamIndex + 1}, got ${honeyGlowIndex}`);
  allChecksPass = false;
}

// Count total light themes
const lightThemes = THEME_PRESETS.filter(t => t.mode === 'light');
console.log('\n=== Theme Count ===');
console.log(`Total light themes: ${lightThemes.length}`);
if (lightThemes.length === 15) {
  console.log('✅ Correct count: 5 existing + 10 new = 15 light themes');
} else {
  console.error(`❌ Expected 15 light themes, got ${lightThemes.length}`);
  allChecksPass = false;
}

// Final result
console.log('\n=== Final Result ===');
if (allPropsPresent && allChecksPass) {
  console.log('✅ ALL CHECKS PASSED - Honey Glow theme successfully added!');
  process.exit(0);
} else {
  console.error('❌ SOME CHECKS FAILED - Please review the errors above');
  process.exit(1);
}
