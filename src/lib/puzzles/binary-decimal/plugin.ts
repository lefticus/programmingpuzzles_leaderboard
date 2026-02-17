import { createConversionPlugin, generateConversionRound, timerStandard, bitLabel } from '$lib/puzzles/shared';

export const binaryDecimalPlugin = createConversionPlugin({
	slug: 'binary-decimal',
	name: 'Binary ↔ Decimal',
	description: 'Convert between binary and decimal numbers. Difficulty scales from 1-bit to 64-bit.',
	minDifficulty: 1,
	maxDifficulty: 64,
	difficultyLabel: bitLabel,
	timerConfig: timerStandard,
	timerFallback: 120,
	generateRound: (d, seen) => generateConversionRound(d, seen, 'binary', 'decimal')
});
