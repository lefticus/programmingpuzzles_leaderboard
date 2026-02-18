<script lang="ts">
	import type { GameState } from '$lib/engine/game-state.svelte';

	let { gameState }: { gameState: GameState } = $props();

	const scoreColor = $derived(gameState.score < 0 ? 'var(--error)' : 'var(--accent)');
	const isSprint = $derived(gameState.mode === 'sprint');
	const strikes = $derived(gameState.consecutiveWrong);
</script>

<div class="score-display">
	<div class="stat">
		<div class="stat-value mono" style="color: {scoreColor}">{gameState.score}</div>
		<div class="stat-label">Score</div>
	</div>
	<div class="stat">
		<div class="stat-value mono">{gameState.roundsPlayed}</div>
		<div class="stat-label">Rounds</div>
	</div>
	<div class="stat">
		<div class="stat-value mono">{gameState.streak}</div>
		<div class="stat-label">Streak</div>
	</div>
	{#if isSprint}
		<div class="stat">
			<div class="strikes" title="{strikes} of 3 strikes">
				{#each [0, 1, 2] as i}
					<span class="strike-dot" class:active={i < strikes}>✕</span>
				{/each}
			</div>
			<div class="stat-label">Strikes</div>
		</div>
	{/if}
	<div class="stat">
		<div class="stat-value mono">{gameState.totalCorrect}/{gameState.totalCorrect + gameState.totalWrong || 0}</div>
		<div class="stat-label">Accuracy</div>
	</div>
</div>

<style>
	.score-display {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.stat {
		text-align: center;
		min-width: 70px;
	}

	.stat-value {
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--accent);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.2rem;
	}

	.strikes {
		display: flex;
		gap: 0.3rem;
		justify-content: center;
		font-size: 1.4rem;
		line-height: 1;
		padding-top: 0.1rem;
	}

	.strike-dot {
		color: var(--border);
		font-weight: 700;
		transition: color 0.2s;
	}

	.strike-dot.active {
		color: var(--error);
	}
</style>
