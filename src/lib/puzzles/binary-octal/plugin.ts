import { createConversionPlugin, generateConversionRound, timerOctal, bitLabel } from '$lib/puzzles/shared';

export const binaryOctalPlugin = createConversionPlugin({
	slug: 'binary-octal',
	name: 'Binary ↔ Octal',
	description: 'Convert between binary and octal. Each octal digit is 3 bits.',
	minDifficulty: 1,
	maxDifficulty: 64,
	difficultyLabel: bitLabel,
	timerConfig: timerOctal,
	timerFallback: 90,
	generateRound: (d, seen) => generateConversionRound(d, seen, 'binary', 'octal')
});
