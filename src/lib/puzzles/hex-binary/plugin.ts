import { createConversionPlugin, generateConversionRound, timerHexBinary, bitLabel } from '$lib/puzzles/shared';

export const hexBinaryPlugin = createConversionPlugin({
	slug: 'hex-binary',
	name: 'Hex ↔ Binary',
	description: 'Convert between hexadecimal and binary. Each hex digit is one nibble.',
	minDifficulty: 1,
	maxDifficulty: 64,
	difficultyLabel: bitLabel,
	timerConfig: timerHexBinary,
	timerFallback: 60,
	generateRound: (d, seen) => generateConversionRound(d, seen, 'hex', 'binary')
});
