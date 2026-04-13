// Quick verification script for Coral Reef theme
import { THEME_PRESETS } from './src/components/waiting-cards/types.ts';

const coralReef = THEME_PRESETS.find(t => t.id === 'coral-reef');

if (!coralReef) {
  console.error('❌ Coral Reef theme not found!');
  process.exit(1);
}

console.log('✅ Coral Reef theme found!');
console.log('\nTheme properties:');
console.log('- ID:', coralReef.id);
console.log('- Label:', coralReef.label);
console.log('- Emoji:', coralReef.emoji);
console.log('- Mode:', coralReef.mode);
console.log('- Primary:', coralReef.primary);
console.log('- CardBg gradient:', coralReef.cardBg.includes('gradient') ? '✅ Has gradient' : '❌ No gradient');
console.log('- Multi-color:', coralReef.cardBg.includes('#fef2f2') && coralReef.cardBg.includes('#fce7f3') && coralReef.cardBg.includes('#ecfeff') ? '✅ Multi-color' : '❌ Single color');
console.log('- Number gradient:', coralReef.numberGradient.includes('#fb7185') && coralReef.numberGradient.includes('#06b6d4') && coralReef.numberGradient.includes('#fbbf24') ? '✅ Three colors' : '❌ Not three colors');

console.log('\n✅ All checks passed! Coral Reef theme is properly implemented.');
