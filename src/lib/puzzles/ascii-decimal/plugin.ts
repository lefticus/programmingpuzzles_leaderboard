import { createConversionPlugin, generateAsciiConversionRound, timerAscii, charLabel } from '$lib/puzzles/shared';

export const asciiDecimalPlugin = createConversionPlugin({
	slug: 'ascii-decimal',
	name: 'ASCII ↔ Decimal',
	description: 'Convert between ASCII letters (A-Z) and decimal. Difficulty scales from 1 to 8 characters.',
	minDifficulty: 1,
	maxDifficulty: 8,
	difficultyLabel: charLabel,
	timerConfig: timerAscii,
	timerFallback: 40,
	generateRound: (d, seen) => generateAsciiConversionRound(d, seen, 'decimal')
});
