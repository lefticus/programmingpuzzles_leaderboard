import { createConversionPlugin, generateConversionRound, timerOctal, bitLabel } from '$lib/puzzles/shared';

export const octalDecimalPlugin = createConversionPlugin({
	slug: 'octal-decimal',
	name: 'Octal ↔ Decimal',
	description: 'Convert between octal and decimal numbers.',
	minDifficulty: 1,
	maxDifficulty: 64,
	difficultyLabel: bitLabel,
	timerConfig: timerOctal,
	timerFallback: 90,
	generateRound: (d, seen) => generateConversionRound(d, seen, 'octal', 'decimal')
});
