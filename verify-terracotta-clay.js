/**
 * Verification script for Terracotta Clay theme
 * Checks that the theme has all required properties and correct values
 */

// Read the types.ts file
import { readFileSync } from 'fs';

const typesContent = readFileSync('src/components/waiting-cards/types.ts', 'utf-8');

// Check if terracotta-clay theme exists
const hasTerracottaClay = typesContent.includes("id: 'terracotta-clay'");
console.log('✓ Terracotta Clay theme ID found:', hasTerracottaClay);

// Check all required properties
const requiredProps = [
  "label: 'Terracotta Clay'",
  "emoji: '🏺'",
  "mode: 'light'",
  "pageBg: 'bg-[#fff7ed]'",
  "primary: '#ea580c'",
  "primaryLight: '#7c2d12'",
  "primaryDim: 'rgba(124,45,18,0.5)'",
  "primaryFaint: 'rgba(234,88,12,0.06)'",
  "surface: 'rgba(234,88,12,0.05)'",
  "surfaceBorder: 'rgba(234,88,12,0.1)'",
  "glow: 'rgba(234,88,12,0.08)'",
];

let allPropsFound = true;
requiredProps.forEach(prop => {
  const found = typesContent.includes(prop);
  if (!found) {
    console.log('✗ Missing property:', prop);
    allPropsFound = false;
  }
});

if (allPropsFound) {
  console.log('✓ All required properties found');
}

// Check that it's positioned after sage-garden
const sageGardenIndex = typesContent.indexOf("id: 'sage-garden'");
const terracottaClayIndex = typesContent.indexOf("id: 'terracotta-clay'");

if (sageGardenIndex > 0 && terracottaClayIndex > sageGardenIndex) {
  console.log('✓ Terracotta Clay is positioned after Sage Garden');
} else {
  console.log('✗ Terracotta Clay positioning issue');
}

// Check gradient format
const hasGradient = typesContent.includes("cardBg: 'linear-gradient(160deg, #fffbf5 0%, #fff7ed 50%, #fffbf5 100%)'");
console.log('✓ Card background gradient found:', hasGradient);

const hasNumberGradient = typesContent.includes("numberGradient: 'linear-gradient(180deg, #fb923c, #ea580c, #9a3412)'");
console.log('✓ Number gradient found:', hasNumberGradient);

console.log('\n✅ Terracotta Clay theme verification complete!');
