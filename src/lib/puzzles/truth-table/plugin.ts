import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import BoolPuzzle from '$lib/components/BoolPuzzle.svelte';
import { generateBoolRound, timerForBool, boolOpsLabel } from '../bool-engine';

export const truthTablePlugin: PuzzlePlugin = {
	slug: 'truth-table',
	name: 'Truth Tables',
	description:
		'Evaluate boolean logic expressions with given variable assignments. Apply AND, OR, NOT, and XOR operations.',
	icon: '',
	component: BoolPuzzle,
	minDifficulty: 1,
	maxDifficulty: 6,
	difficultyLabel: boolOpsLabel,
	timerDuration: timerForBool,
	generateRound: (d: number, seen: Set<string>) => generateBoolRound(d, seen),
	scoreForSolve: calculateScore,
	shouldAdvance: (stats: RoundStats) =>
		stats.consecutiveCorrect >= Math.min(stats.difficulty + 2, 10),
	shouldRegress: (stats: RoundStats) => stats.consecutiveWrong >= 2
};
