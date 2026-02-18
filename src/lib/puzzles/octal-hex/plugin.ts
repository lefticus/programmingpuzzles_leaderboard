import { createConversionPlugin, generateConversionRound, timerHexBinary, bitLabel } from '$lib/puzzles/shared';

export const octalHexPlugin = createConversionPlugin({
	slug: 'octal-hex',
	name: 'Octal ↔ Hex',
	description: 'Convert between octal and hexadecimal. Requires thinking across groupings (3-bit vs 4-bit).',
	minDifficulty: 1,
	maxDifficulty: 64,
	difficultyLabel: bitLabel,
	timerConfig: timerHexBinary,
	timerFallback: 60,
	generateRound: (d, seen) => generateConversionRound(d, seen, 'octal', 'hex')
});
