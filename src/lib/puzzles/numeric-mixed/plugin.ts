import type { PuzzlePlugin, RoundStats, NumberBase } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import { generateConversionRound } from '$lib/puzzles/shared';
import ConversionPuzzle from '$lib/components/ConversionPuzzle.svelte';

const numericBases: NumberBase[] = ['binary', 'octal', 'decimal', 'hex'];

function pickTwoRandomBases(): [NumberBase, NumberBase] {
	const a = Math.floor(Math.random() * numericBases.length);
	let b = Math.floor(Math.random() * (numericBases.length - 1));
	if (b >= a) b++;
	return [numericBases[a], numericBases[b]];
}

function timerDuration(bits: number): number {
	if (bits <= 4) return 10;
	if (bits <= 8) return 15;
	if (bits <= 16) return 25;
	if (bits <= 24) return 40;
	if (bits <= 32) return 60;
	if (bits <= 48) return 90;
	return 120;
}

export const numericMixedPlugin: PuzzlePlugin = {
	slug: 'numeric-mixed',
	name: 'Numeric Mixed',
	description:
		'Random mix of binary, octal, decimal, and hex conversions. A different pair each round.',
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
		const [baseA, baseB] = pickTwoRandomBases();
		return generateConversionRound(difficulty, seen, baseA, baseB);
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
