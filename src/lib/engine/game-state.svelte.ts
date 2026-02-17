import type { GamePhase, GameMode, PuzzlePlugin, PuzzleRound, RoundStats } from './types';
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
	totalCorrect = $state(0);
	totalWrong = $state(0);
	currentRound = $state<PuzzleRound | null>(null);
	lastAnswerCorrect = $state<boolean | null>(null);
	lastScore = $state(0);

	timer = new CountdownTimer();
	plugin: PuzzlePlugin;
	seen = new Set<string>();

	constructor(plugin: PuzzlePlugin) {
		this.plugin = plugin;
		this.difficulty = plugin.minDifficulty;
	}

	startGame(mode: GameMode) {
		this.mode = mode;
		this.score = 0;
		this.difficulty = this.plugin.minDifficulty;
		this.maxDifficulty = this.plugin.minDifficulty;
		this.roundsPlayed = 0;
		this.consecutiveCorrect = 0;
		this.consecutiveWrong = 0;
		this.totalCorrect = 0;
		this.totalWrong = 0;
		this.seen.clear();
		this.nextRound();
	}

	nextRound() {
		this.currentRound = this.plugin.generateRound(this.difficulty, this.seen);
		this.lastAnswerCorrect = null;
		this.lastScore = 0;
		this.phase = 'playing';
		const duration = this.plugin.timerDuration(this.difficulty);
		this.timer.start(duration, () => this.handleTimeout());
	}

	submitAnswer(answer: string) {
		if (this.phase !== 'playing') return;
		this.timer.stop();
		this.roundsPlayed++;

		const correct = answer.trim() === this.currentRound!.answer;
		this.lastAnswerCorrect = correct;

		if (correct) {
			const points = this.plugin.scoreForSolve(
				this.difficulty,
				this.timer.remaining,
				this.timer.duration
			);
			this.lastScore = points;
			this.score += points;
			this.consecutiveCorrect++;
			this.consecutiveWrong = 0;
			this.totalCorrect++;

			const stats = this.getStats();
			if (this.plugin.shouldAdvance(stats) && this.difficulty < this.plugin.maxDifficulty) {
				this.difficulty++;
				this.consecutiveCorrect = 0;
			}
			if (this.difficulty > this.maxDifficulty) {
				this.maxDifficulty = this.difficulty;
			}
		} else {
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
		this.totalWrong++;

		if (this.mode === 'sprint') {
			this.lastScore = 0;
			if (this.consecutiveWrong >= 3) {
				setTimeout(() => this.endGame(), 1500);
				return;
			}
		} else {
			// Marathon: deduct half the points you would have earned at full time
			const penalty = Math.floor(Math.pow(this.difficulty, 1.5) * 5);
			this.lastScore = -penalty;
			this.score -= penalty;
		}

		if (this.difficulty > this.plugin.minDifficulty) {
			const stats = this.getStats();
			if (this.plugin.shouldRegress(stats)) {
				this.difficulty--;
			}
		}
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
			roundsPlayed: this.roundsPlayed
		};
	}

	destroy() {
		this.timer.destroy();
	}
}
