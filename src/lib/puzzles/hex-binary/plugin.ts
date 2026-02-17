import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import { generateConversionRound } from '$lib/puzzles/shared';
import ConversionPuzzle from '$lib/components/ConversionPuzzle.svelte';

function timerDuration(bits: number): number {
	if (bits <= 8) return 10;
	if (bits <= 16) return 15;
	if (bits <= 32) return 25;
	if (bits <= 48) return 40;
	return 60;
}

export const hexBinaryPlugin: PuzzlePlugin = {
	slug: 'hex-binary',
	name: 'Hex ↔ Binary',
	description: 'Convert between hexadecimal and binary. Each hex digit is one nibble.',
	icon: '',
	component: ConversionPuzzle,
	minDifficulty: 4,
	maxDifficulty: 64,

	difficultyLabel(level: number): string {
		const nibbles = Math.ceil(level / 4);
		return `${nibbles} nibble${nibbles > 1 ? 's' : ''} (${level}-bit)`;
	},

	timerDuration(difficulty: number): number {
		return timerDuration(difficulty);
	},

	generateRound(difficulty: number, seen: Set<string>) {
		return generateConversionRound(difficulty, seen, 'hex', 'binary');
	},

	scoreForSolve(difficulty: number, timeRemaining: number, timerDur: number): number {
		return calculateScore(difficulty, timeRemaining, timerDur);
	},

	shouldAdvance(stats: RoundStats): boolean {
		return stats.consecutiveCorrect >= 3;
	},

	shouldRegress(stats: RoundStats): boolean {
		return stats.consecutiveWrong >= 2;
	}
};
