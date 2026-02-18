<script lang="ts">
	import type { PuzzlePlugin, GameMode } from '$lib/engine/types';
	import { GameState } from '$lib/engine/game-state.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { supabase } from '$lib/supabase';
	import Timer from './Timer.svelte';
	import ScoreDisplay from './ScoreDisplay.svelte';
	import Leaderboard from './Leaderboard.svelte';
	import ReferenceTable from './ReferenceTable.svelte';
	import ScoreAnimation from './ScoreAnimation.svelte';
	import LevelUpEffect from './LevelUpEffect.svelte';
	import { base } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';

	let { plugin }: { plugin: PuzzlePlugin } = $props();

	const gameState = new GameState(() => plugin);
	const refVariant = $derived(plugin.slug.includes('ascii') ? 'ascii' : 'numeric' as const);
	let submitting = $state(false);
	let submitted = $state(false);
	let submitError = $state('');

	const canAdvance = $derived(
		(gameState.phase === 'answered' || gameState.phase === 'level-up') &&
		!(gameState.mode === 'sprint' && gameState.consecutiveWrong >= 3)
	);

	const canToggleRef = $derived(
		gameState.phase !== 'done' && gameState.phase !== 'ready'
	);

	const modeLabels: Record<GameMode, string> = {
		sprint: 'Sprint',
		marathon: 'Marathon',
		untimed: 'Untimed'
	};

	function advanceOrCelebrate() {
		if (gameState.phase === 'answered' && gameState.lastAdvanced) {
			gameState.showLevelUp();
		} else {
			gameState.nextRound();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && canAdvance) {
			e.preventDefault();
			advanceOrCelebrate();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		gameState.destroy();
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	async function submitScore() {
		if (!auth.user) return;
		submitting = true;
		submitError = '';

		const { error } = await supabase.from('scores').insert({
			user_id: auth.user.id,
			puzzle_slug: `${plugin.slug}-${gameState.mode}`,
			score: gameState.score,
			max_difficulty: gameState.maxDifficulty,
			rounds_played: gameState.roundsPlayed
		});

		submitting = false;
		if (error) {
			submitError = error.message;
		} else {
			submitted = true;
		}
	}

	function startWithMode(mode: GameMode) {
		submitted = false;
		gameState.startGame(mode);
	}

	const PuzzleComponent = $derived(plugin.component);
</script>

<div class="game-shell">
	<div class="game-header">
		<h2>{plugin.name}</h2>
	</div>

	{#if gameState.phase === 'ready'}
		<div class="ready-screen">
			<p>{plugin.description}</p>
			<div class="mode-picker">
				<button class="mode-card card" onclick={() => startWithMode('sprint')}>
					<div class="mode-name">Sprint</div>
					<div class="mode-desc">3 wrong in a row and you're out. High risk, high reward.</div>
				</button>
				<button class="mode-card card" onclick={() => startWithMode('marathon')}>
					<div class="mode-name">Marathon</div>
					<div class="mode-desc">No game over. Wrong answers deduct points. End when you want.</div>
				</button>
				<button class="mode-card card" onclick={() => startWithMode('untimed')}>
					<div class="mode-name">Untimed</div>
					<div class="mode-desc">No timer, no penalty. Practice at your own pace.</div>
				</button>
			</div>
		</div>
	{:else if gameState.phase === 'playing' || gameState.phase === 'answered' || gameState.phase === 'level-up'}
		<div class="game-area">
			<div class="top-bar">
				<div class="mode-badge">{modeLabels[gameState.mode]}</div>
				<button
					class="ref-toggle btn btn-secondary"
					class:active={gameState.referenceVisible}
					onclick={() => gameState.toggleReference()}
					disabled={!canToggleRef}
				>
					{gameState.referenceVisible ? 'Hide Table' : 'Show Table'}
					<span class="multiplier-hint">
						{gameState.referenceVisible ? '(1x)' : '(2x)'}
					</span>
				</button>
			</div>
			{#if gameState.mode !== 'untimed'}
				<Timer timer={gameState.timer} />
			{/if}
			<ScoreDisplay {gameState} />
			{#if gameState.referenceVisible}
				<ReferenceTable variant={refVariant} />
			{/if}
			<div class="puzzle-area">
				<PuzzleComponent {gameState} />
				{#if gameState.phase === 'answered' && gameState.lastBreakdown}
					{#key gameState.roundsPlayed}
						<ScoreAnimation breakdown={gameState.lastBreakdown} />
					{/key}
				{/if}
				{#if gameState.phase === 'level-up'}
					<LevelUpEffect label={gameState.plugin.difficultyLabel(gameState.difficulty)} />
				{/if}
			</div>
			<div class="game-controls">
				{#if canAdvance}
					<button class="btn btn-primary" onclick={() => advanceOrCelebrate()}>
						{gameState.phase === 'level-up' ? 'Continue' : 'Next Round'}
					</button>
				{/if}
				<button class="btn btn-danger" onclick={() => gameState.endGame()}>
					End Game
				</button>
			</div>
		</div>
	{:else if gameState.phase === 'done'}
		<div class="done-screen">
			<h3>Game Over</h3>
			<div class="mode-badge done-mode">{modeLabels[gameState.mode]}</div>
			<div class="final-stats">
				<div class="final-stat">
					<span class="final-value mono">{gameState.score}</span>
					<span class="final-label">Final Score</span>
				</div>
				<div class="final-stat">
					<span class="final-value mono">{gameState.roundsPlayed}</span>
					<span class="final-label">Rounds</span>
				</div>
				<div class="final-stat">
					<span class="final-value mono">{gameState.plugin.difficultyLabel(gameState.maxDifficulty)}</span>
					<span class="final-label">Max Difficulty</span>
				</div>
				<div class="final-stat">
					<span class="final-value mono">
						{gameState.roundsPlayed > 0 ? Math.round((gameState.totalCorrect / gameState.roundsPlayed) * 100) : 0}%
					</span>
					<span class="final-label">Accuracy</span>
				</div>
			</div>

			{#if auth.user && !submitted}
				<button
					class="btn btn-primary"
					onclick={submitScore}
					disabled={submitting || gameState.score <= 0}
				>
					{submitting ? 'Submitting...' : 'Submit Score'}
				</button>
				{#if submitError}
					<p class="error-text">{submitError}</p>
				{/if}
			{:else if !auth.user}
				<p class="hint">
					<a href="{base}/login/">Sign in</a> to submit your score to the leaderboard.
				</p>
			{/if}

			{#if submitted}
				<p class="success-text">Score submitted!</p>
			{/if}

			<div class="done-actions">
				<button class="btn btn-primary" onclick={() => { gameState.phase = 'ready'; }}>
					Play Again
				</button>
				<a href="{base}/puzzles/" class="btn btn-secondary">Back to Puzzles</a>
			</div>

			{#if submitted}
				<div class="leaderboard-section">
					<Leaderboard puzzleSlug="{plugin.slug}-{gameState.mode}" />
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.game-shell {
		max-width: 700px;
		margin: 0 auto;
	}

	.game-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.game-header h2 {
		font-size: 1.5rem;
	}

	.ready-screen {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.hint {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.mode-picker {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		width: 100%;
		max-width: 650px;
	}

	.mode-card {
		text-align: center;
		cursor: pointer;
		transition: border-color 0.15s, transform 0.15s;
	}

	.mode-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}

	.mode-name {
		font-size: 1.1rem;
		font-weight: 700;
		margin-bottom: 0.4rem;
	}

	.mode-desc {
		font-size: 0.8rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.mode-badge {
		text-align: center;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	.done-mode {
		margin-top: -0.5rem;
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.ref-toggle {
		font-size: 0.75rem;
		padding: 0.3rem 0.7rem;
		gap: 0.3rem;
	}

	.ref-toggle.active {
		border-color: var(--accent);
	}

	.multiplier-hint {
		color: var(--accent);
		font-weight: 700;
	}

	.game-area {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.puzzle-area {
		position: relative;
		overflow: hidden;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 2rem;
	}

	.game-controls {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
	}

	.done-screen {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}

	.done-screen h3 {
		font-size: 1.8rem;
	}

	.final-stats {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.final-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.final-value {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--accent);
	}

	.final-label {
		font-size: 0.75rem;
		color: var(--text-dim);
		text-transform: uppercase;
	}

	.done-actions {
		display: flex;
		gap: 0.75rem;
	}

	.error-text {
		color: var(--error);
		font-size: 0.85rem;
	}

	.success-text {
		color: var(--success);
		font-weight: 600;
	}

	.leaderboard-section {
		width: 100%;
		margin-top: 1rem;
	}
</style>
