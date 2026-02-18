import type { Component } from 'svelte';

export interface RoundStats {
	consecutiveCorrect: number;
	consecutiveWrong: number;
	totalCorrect: number;
	totalWrong: number;
	roundsPlayed: number;
	difficulty: number;
}

export type NumberBase = 'binary' | 'octal' | 'decimal' | 'hex' | 'ascii';

export interface PuzzleRound {
	prompt: string;
	answer: string;
	displayPrompt?: string;
	answerType?: NumberBase;
	promptLabel?: string;
}

export interface PuzzlePlugin {
	slug: string;
	name: string;
	description: string;
	icon: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: Component<any>;
	minDifficulty: number;
	maxDifficulty: number;
	difficultyLabel(level: number): string;
	timerDuration(difficulty: number): number;
	generateRound(difficulty: number, seen: Set<string>): PuzzleRound;
	scoreForSolve(difficulty: number, timeRemaining: number, timerDuration: number): number;
	shouldAdvance(stats: RoundStats): boolean;
	shouldRegress(stats: RoundStats): boolean;
}

export interface ScoreBreakdown {
	correct: boolean;
	basePoints: number;
	timeBonus: number;
	timeRemaining: number;
	streakCount: number;
	streakBonus: number;
	multiplier: number;
	total: number;
	difficulty: number;
	difficultyLabel: string;
}

export type GamePhase = 'ready' | 'starting' | 'playing' | 'answered' | 'level-up' | 'done';
export type GameMode = 'sprint' | 'marathon' | 'untimed';

export interface GameSession {
	score: number;
	maxDifficulty: number;
	roundsPlayed: number;
}
