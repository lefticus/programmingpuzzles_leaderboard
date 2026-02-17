import { createConversionPlugin, generateConversionRound, timerHexBinary } from '$lib/puzzles/shared';

export const hexBinaryPlugin = createConversionPlugin({
	slug: 'hex-binary',
	name: 'Hex ↔ Binary',
	description: 'Convert between hexadecimal and binary. Each hex digit is one nibble.',
	minDifficulty: 4,
	maxDifficulty: 64,
	difficultyLabel: (level) => {
		const nibbles = Math.ceil(level / 4);
		return `${nibbles} nibble${nibbles > 1 ? 's' : ''} (${level}-bit)`;
	},
	timerConfig: timerHexBinary,
	timerFallback: 60,
	generateRound: (d, seen) => generateConversionRound(d, seen, 'hex', 'binary')
});
