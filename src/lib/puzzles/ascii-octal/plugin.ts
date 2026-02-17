import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import { generateAsciiConversionRound } from '$lib/puzzles/shared';
import ConversionPuzzle from '$lib/components/ConversionPuzzle.svelte';

function timerDuration(numChars: number): number {
	if (numChars <= 2) return 10;
	if (numChars <= 4) return 15;
	if (numChars <= 6) return 25;
	return 40;
}

export const asciiOctalPlugin: PuzzlePlugin = {
	slug: 'ascii-octal',
	name: 'ASCII ↔ Octal',
	description: 'Convert between ASCII letters (A-Z) and octal. Difficulty scales from 1 to 8 characters.',
	icon: '',
	component: ConversionPuzzle,
	minDifficulty: 1,
	maxDifficulty: 8,

	difficultyLabel(level: number): string {
		return `${level} char${level === 1 ? '' : 's'}`;
	},

	timerDuration(difficulty: number): number {
		return timerDuration(difficulty);
	},

	generateRound(difficulty: number, seen: Set<string>) {
		return generateAsciiConversionRound(difficulty, seen, 'octal');
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
