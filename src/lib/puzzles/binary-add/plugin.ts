import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import BinaryAddPuzzle from '$lib/components/BinaryAddPuzzle.svelte';
import {
	generateBinaryAddRound,
	timerForBinaryAdd,
	binaryAddLabel,
	bitsForLevel
} from '../binary-add-engine';

export const binaryAddPlugin: PuzzlePlugin = {
	slug: 'binary-add',
	name: 'Binary Addition',
	description:
		'Add two binary numbers together. Compute the sum and express it in binary.',
	icon: '',
	component: BinaryAddPuzzle,
	minDifficulty: 1,
	maxDifficulty: 6,
	difficultyLabel: binaryAddLabel,
	timerDuration: (d: number) => timerForBinaryAdd(bitsForLevel(d)),
	generateRound: (d: number, seen: Set<string>) =>
		generateBinaryAddRound(bitsForLevel(d), seen),
	scoreForSolve: calculateScore,
	shouldAdvance: (stats: RoundStats) =>
		stats.consecutiveCorrect >= Math.min(stats.difficulty + 2, 10),
	shouldRegress: (stats: RoundStats) => stats.consecutiveWrong >= 2
};
