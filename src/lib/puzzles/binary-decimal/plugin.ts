import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import { generateConversionRound } from '$lib/puzzles/shared';
import ConversionPuzzle from '$lib/components/ConversionPuzzle.svelte';

function timerDuration(bits: number): number {
	if (bits <= 4) return 10;
	if (bits <= 8) return 15;
	if (bits <= 16) return 25;
	if (bits <= 24) return 40;
	if (bits <= 32) return 60;
	if (bits <= 48) return 90;
	return 120;
}

export const binaryDecimalPlugin: PuzzlePlugin = {
	slug: 'binary-decimal',
	name: 'Binary ↔ Decimal',
	description: 'Convert between binary and decimal numbers. Difficulty scales from 1-bit to 64-bit.',
	icon: '',
	component: ConversionPuzzle,
	minDifficulty: 1,
	maxDifficulty: 64,

	difficultyLabel(level: number): string {
		return `${level}-bit`;
	},

	timerDuration(difficulty: number): number {
		return timerDuration(difficulty);
	},

	generateRound(difficulty: number, seen: Set<string>) {
		return generateConversionRound(difficulty, seen, 'binary', 'decimal');
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
