/**
 * Verification script for Sage Garden theme
 * Checks that the theme has all required properties and correct values
 */

import { THEME_PRESETS } from './src/components/waiting-cards/types.ts';

const sageGarden = THEME_PRESETS.find(t => t.id === 'sage-garden');

if (!sageGarden) {
  console.error('❌ Sage Garden theme not found!');
  process.exit(1);
}

console.log('✅ Sage Garden theme found');

// Check all required properties
const requiredProps = [
  'id', 'label', 'emoji', 'mode', 'pageBg', 'cardBg', 'cardBorder',
  'primary', 'primaryLight', 'primaryDim', 'primaryFaint',
  'surface', 'surfaceBorder', 'glow', 'numberGradient', 'numberGlow'
];

let allPropsPresent = true;
for (const prop of requiredProps) {
  if (!(prop in sageGarden)) {
    console.error(`❌ Missing property: ${prop}`);
    allPropsPresent = false;
  }
}

if (allPropsPresent) {
  console.log('✅ All 14 required properties present');
}

// Verify specific values
const checks = [
  { name: 'id', expected: 'sage-garden', actual: sageGarden.id },
  { name: 'label', expected: 'Sage Garden', actual: sageGarden.label },
  { name: 'emoji', expected: '🌿', actual: sageGarden.emoji },
  { name: 'mode', expected: 'light', actual: sageGarden.mode },
  { name: 'primary', expected: '#84cc16', actual: sageGarden.primary },
  { name: 'primaryLight', expected: '#365314', actual: sageGarden.primaryLight },
];

let allChecksPass = true;
for (const check of checks) {
  if (check.actual === check.expected) {
    console.log(`✅ ${check.name}: ${check.actual}`);
  } else {
    console.error(`❌ ${check.name}: expected ${check.expected}, got ${check.actual}`);
    allChecksPass = false;
  }
}

// Check position (should be after sunset-bloom)
const sunsetBloomIndex = THEME_PRESETS.findIndex(t => t.id === 'sunset-bloom');
const sageGardenIndex = THEME_PRESETS.findIndex(t => t.id === 'sage-garden');

if (sageGardenIndex > sunsetBloomIndex) {
  console.log(`✅ Positioned correctly after sunset-bloom (index ${sageGardenIndex})`);
} else {
  console.error(`❌ Incorrect position: index ${sageGardenIndex}, should be after ${sunsetBloomIndex}`);
  allChecksPass = false;
}

// Check for unique emoji
const emojiCounts = {};
THEME_PRESETS.forEach(t => {
  emojiCounts[t.emoji] = (emojiCounts[t.emoji] || 0) + 1;
});

if (emojiCounts['🌿'] === 1) {
  console.log('✅ Emoji 🌿 is unique');
} else {
  console.error(`❌ Emoji 🌿 is used ${emojiCounts['🌿']} times`);
  allChecksPass = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allPropsPresent && allChecksPass) {
  console.log('✅ All checks passed! Sage Garden theme is correctly implemented.');
  process.exit(0);
} else {
  console.error('❌ Some checks failed. Please review the implementation.');
  process.exit(1);
}
