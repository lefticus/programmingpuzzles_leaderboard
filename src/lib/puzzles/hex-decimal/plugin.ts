import { createConversionPlugin, generateConversionRound, timerStandard, bitLabel } from '$lib/puzzles/shared';

export const hexDecimalPlugin = createConversionPlugin({
	slug: 'hex-decimal',
	name: 'Hex ↔ Decimal',
	description: 'Convert between hexadecimal and decimal numbers.',
	minDifficulty: 4,
	maxDifficulty: 64,
	difficultyLabel: bitLabel,
	timerConfig: timerStandard,
	timerFallback: 120,
	generateRound: (d, seen) => generateConversionRound(d, seen, 'hex', 'decimal')
});
