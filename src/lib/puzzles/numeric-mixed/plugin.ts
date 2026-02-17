import type { NumberBase } from '$lib/engine/types';
import { createConversionPlugin, generateConversionRound, timerStandard, bitLabel } from '$lib/puzzles/shared';

const numericBases: NumberBase[] = ['binary', 'octal', 'decimal', 'hex'];

function pickTwoRandomBases(): [NumberBase, NumberBase] {
	const a = Math.floor(Math.random() * numericBases.length);
	let b = Math.floor(Math.random() * (numericBases.length - 1));
	if (b >= a) b++;
	return [numericBases[a], numericBases[b]];
}

export const numericMixedPlugin = createConversionPlugin({
	slug: 'numeric-mixed',
	name: 'Numeric Mixed',
	description: 'Random mix of binary, octal, decimal, and hex conversions. A different pair each round.',
	minDifficulty: 1,
	maxDifficulty: 64,
	difficultyLabel: bitLabel,
	timerConfig: timerStandard,
	timerFallback: 120,
	generateRound: (d, seen) => {
		const [baseA, baseB] = pickTwoRandomBases();
		return generateConversionRound(d, seen, baseA, baseB);
	}
});
