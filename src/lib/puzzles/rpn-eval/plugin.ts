import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import ExpressionPuzzle from '$lib/components/ExpressionPuzzle.svelte';
import { generateExpressionRound, timerForOps, opsLabel } from '../expression-engine';

export const rpnEvalPlugin: PuzzlePlugin = {
	slug: 'rpn-eval',
	name: 'RPN Evaluation',
	description: 'Evaluate expressions written in Reverse Polish Notation (postfix). Operators come after their operands.',
	icon: '',
	component: ExpressionPuzzle,
	minDifficulty: 1,
	maxDifficulty: 6,
	difficultyLabel: opsLabel,
	timerDuration: timerForOps,
	generateRound: (d: number, seen: Set<string>) => generateExpressionRound(d, seen, 'rpn'),
	scoreForSolve: calculateScore,
	shouldAdvance: (stats: RoundStats) =>
		stats.consecutiveCorrect >= Math.min(stats.difficulty + 2, 10),
	shouldRegress: (stats: RoundStats) => stats.consecutiveWrong >= 2
};
