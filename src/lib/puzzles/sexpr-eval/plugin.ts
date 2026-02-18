import type { PuzzlePlugin, RoundStats } from '$lib/engine/types';
import { calculateScore } from '$lib/engine/scoring';
import ExpressionPuzzle from '$lib/components/ExpressionPuzzle.svelte';
import { generateExpressionRound, timerForOps, opsLabel } from '../expression-engine';

export const sexprEvalPlugin: PuzzlePlugin = {
	slug: 'sexpr-eval',
	name: 'S-Expression Evaluation',
	description: 'Evaluate expressions written as S-expressions (prefix). Operators come before their operands in parentheses.',
	icon: '',
	component: ExpressionPuzzle,
	minDifficulty: 1,
	maxDifficulty: 6,
	difficultyLabel: opsLabel,
	timerDuration: timerForOps,
	generateRound: (d: number, seen: Set<string>) => generateExpressionRound(d, seen, 'sexpr'),
	scoreForSolve: calculateScore,
	shouldAdvance: (stats: RoundStats) =>
		stats.consecutiveCorrect >= Math.min(stats.difficulty + 2, 10),
	shouldRegress: (stats: RoundStats) => stats.consecutiveWrong >= 2
};
