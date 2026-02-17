import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import { generateConversionRound } from '$lib/puzzles/shared';
import ConversionPuzzle from '$lib/components/ConversionPuzzle.svelte';

function timerDuration(bits: number): number {
	if (bits <= 6) return 10;
	if (bits <= 12) return 15;
	if (bits <= 24) return 25;
	if (bits <= 36) return 40;
	if (bits <= 48) return 60;
	return 90;
}

export const binaryOctalPlugin: PuzzlePlugin = {
	slug: 'binary-octal',
	name: 'Binary ↔ Octal',
	description: 'Convert between binary and octal. Each octal digit is 3 bits.',
	icon: '',
	component: ConversionPuzzle,
	minDifficulty: 3,
	maxDifficulty: 63,

	difficultyLabel(level: number): string {
		return `${level}-bit`;
	},

	timerDuration(difficulty: number): number {
		return timerDuration(difficulty);
	},

	generateRound(difficulty: number, seen: Set<string>) {
		return generateConversionRound(difficulty, seen, 'binary', 'octal');
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
