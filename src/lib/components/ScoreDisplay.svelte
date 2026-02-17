<script lang="ts">
	import type { GameState } from '$lib/engine/game-state.svelte';

	let { gameState }: { gameState: GameState } = $props();

	const scoreColor = $derived(gameState.score < 0 ? 'var(--error)' : 'var(--accent)');
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
		<div class="stat-value mono">{gameState.consecutiveCorrect}</div>
		<div class="stat-label">Streak</div>
	</div>
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
</style>
