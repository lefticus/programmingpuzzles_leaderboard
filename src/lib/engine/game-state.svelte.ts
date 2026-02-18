import type { GamePhase, GameMode, PuzzlePlugin, PuzzleRound, RoundStats, ScoreBreakdown } from './types';
import { CountdownTimer } from './timer.svelte';

export class GameState {
	phase = $state<GamePhase>('ready');
	mode = $state<GameMode>('sprint');
	score = $state(0);
	difficulty = $state(1);
	maxDifficulty = $state(1);
	roundsPlayed = $state(0);
	consecutiveCorrect = $state(0);
	consecutiveWrong = $state(0);
	streak = $state(0);
	totalCorrect = $state(0);
	totalWrong = $state(0);
	currentRound = $state<PuzzleRound | null>(null);
	lastAnswerCorrect = $state<boolean | null>(null);
	lastScore = $state(0);
	lastBreakdown = $state<ScoreBreakdown | null>(null);
	lastAdvanced = $state(false);
	referenceVisible = $state(false);
	scoreMultiplier = $derived(this.referenceVisible ? 1 : 2);

	timer = new CountdownTimer();
	private getPlugin: () => PuzzlePlugin;
	get plugin() { return this.getPlugin(); }
	seen = new Set<string>();

	constructor(getPlugin: () => PuzzlePlugin) {
		this.getPlugin = getPlugin;
		this.difficulty = this.plugin.minDifficulty;
	}

	startGame(mode: GameMode) {
		this.mode = mode;
		this.score = 0;
		this.difficulty = this.plugin.minDifficulty;
		this.maxDifficulty = this.plugin.minDifficulty;
		this.roundsPlayed = 0;
		this.consecutiveCorrect = 0;
		this.consecutiveWrong = 0;
		this.streak = 0;
		this.totalCorrect = 0;
		this.totalWrong = 0;
		this.seen.clear();
		this.nextRound();
	}

	nextRound() {
		this.currentRound = this.plugin.generateRound(this.difficulty, this.seen);
		this.lastAnswerCorrect = null;
		this.lastScore = 0;
		this.lastBreakdown = null;
		this.lastAdvanced = false;
		this.phase = 'playing';

		if (this.mode === 'untimed') {
			// No timer in untimed mode
		} else {
			const duration = this.plugin.timerDuration(this.difficulty);
			this.timer.start(duration, () => this.handleTimeout());
		}
	}

	toggleReference() {
		if (this.phase === 'playing' || this.phase === 'answered' || this.phase === 'level-up') {
			this.referenceVisible = !this.referenceVisible;
		}
	}

	submitAnswer(answer: string) {
		if (this.phase !== 'playing') return;
		this.timer.stop();
		this.roundsPlayed++;

		const normalize = (s: string) => s.replace(/^0+(?=.)/, '').toUpperCase();
		const correct = normalize(answer.trim()) === normalize(this.currentRound!.answer);
		this.lastAnswerCorrect = correct;

		if (correct) {
			const basePoints = Math.floor(Math.pow(this.difficulty, 1.5) * 5);
			const timeRemaining = this.mode !== 'untimed' ? this.timer.remaining : 0;
			const timeBonus = this.mode !== 'untimed' ? Math.floor(timeRemaining * 4) : 0;
			this.streak++;
			const streakBonus = Math.floor(basePoints * (this.streak - 1) * 0.1);
			const preMultiplier = basePoints + timeBonus + streakBonus;
			const total = preMultiplier * this.scoreMultiplier;
			this.lastBreakdown = {
				correct: true,
				basePoints,
				timeBonus,
				timeRemaining,
				streakCount: this.streak,
				streakBonus,
				multiplier: this.scoreMultiplier,
				total,
				difficulty: this.difficulty,
				difficultyLabel: this.plugin.difficultyLabel(this.difficulty)
			};
			this.lastScore = total;
			this.score += total;
			this.consecutiveCorrect++;
			this.consecutiveWrong = 0;
			this.totalCorrect++;

			const stats = this.getStats();
			if (this.plugin.shouldAdvance(stats) && this.difficulty < this.plugin.maxDifficulty) {
				this.difficulty++;
				this.consecutiveCorrect = 0;
				this.lastAdvanced = true;
			} else {
				this.lastAdvanced = false;
			}
			if (this.difficulty > this.maxDifficulty) {
				this.maxDifficulty = this.difficulty;
			}
		} else {
			this.lastAdvanced = false;
			this.handleWrong();
		}

		this.phase = 'answered';
	}

	private handleTimeout() {
		if (this.phase !== 'playing') return;
		this.roundsPlayed++;
		this.lastAnswerCorrect = false;
		this.handleWrong();
		this.phase = 'answered';
	}

	private handleWrong() {
		this.consecutiveWrong++;
		this.consecutiveCorrect = 0;
		this.streak = 0;
		this.totalWrong++;

		if (this.mode === 'sprint') {
			this.lastScore = 0;
			this.lastBreakdown = {
				correct: false, basePoints: 0, timeBonus: 0, timeRemaining: 0,
				streakCount: 0, streakBonus: 0,
				multiplier: this.scoreMultiplier, total: 0,
				difficulty: this.difficulty,
				difficultyLabel: this.plugin.difficultyLabel(this.difficulty)
			};
			if (this.consecutiveWrong >= 3) {
				setTimeout(() => this.endGame(), 1500);
				return;
			}
		} else if (this.mode === 'marathon') {
			const penalty = Math.floor(Math.pow(this.difficulty, 1.5) * 5) * this.scoreMultiplier;
			this.lastScore = -penalty;
			this.score -= penalty;
			this.lastBreakdown = {
				correct: false, basePoints: -penalty, timeBonus: 0, timeRemaining: 0,
				streakCount: 0, streakBonus: 0,
				multiplier: 1, total: -penalty,
				difficulty: this.difficulty,
				difficultyLabel: this.plugin.difficultyLabel(this.difficulty)
			};
		} else {
			// Untimed: wrong answers score 0, no penalty
			this.lastScore = 0;
			this.lastBreakdown = {
				correct: false, basePoints: 0, timeBonus: 0, timeRemaining: 0,
				streakCount: 0, streakBonus: 0,
				multiplier: this.scoreMultiplier, total: 0,
				difficulty: this.difficulty,
				difficultyLabel: this.plugin.difficultyLabel(this.difficulty)
			};
		}

		if (this.difficulty > this.plugin.minDifficulty) {
			const stats = this.getStats();
			if (this.plugin.shouldRegress(stats)) {
				this.difficulty--;
			}
		}
	}

	showLevelUp() {
		this.phase = 'level-up';
	}

	endGame() {
		this.timer.stop();
		this.phase = 'done';
	}

	private getStats(): RoundStats {
		return {
			consecutiveCorrect: this.consecutiveCorrect,
			consecutiveWrong: this.consecutiveWrong,
			totalCorrect: this.totalCorrect,
			totalWrong: this.totalWrong,
			roundsPlayed: this.roundsPlayed,
			difficulty: this.difficulty
		};
	}

	destroy() {
		this.timer.destroy();
	}
}
