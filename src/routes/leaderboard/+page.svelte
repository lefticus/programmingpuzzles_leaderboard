<script lang="ts">
	import '$lib/puzzles';
	import { getAllPuzzles } from '$lib/engine/registry';
	import Leaderboard from '$lib/components/Leaderboard.svelte';

	const puzzles = getAllPuzzles();
	let selectedSlug = $state(puzzles.length > 0 ? puzzles[0].slug : '');
</script>

<svelte:head>
	<title>Leaderboard — Puzzle Games</title>
</svelte:head>

<div class="leaderboard-page">
	<h1>Leaderboard</h1>

	{#if puzzles.length > 1}
		<div class="puzzle-tabs">
			{#each puzzles as puzzle}
				<button
					class="tab"
					class:active={selectedSlug === puzzle.slug}
					onclick={() => selectedSlug = puzzle.slug}
				>
					{puzzle.icon} {puzzle.name}
				</button>
			{/each}
		</div>
	{/if}

	<div class="leaderboard-container card">
		{#key selectedSlug}
			<Leaderboard puzzleSlug={selectedSlug} limit={50} />
		{/key}
	</div>
</div>

<style>
	.leaderboard-page {
		max-width: 700px;
		margin: 0 auto;
		text-align: center;
	}

	.leaderboard-page h1 {
		margin-bottom: 1.5rem;
	}

	.puzzle-tabs {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.tab {
		padding: 0.5rem 1rem;
		border-radius: var(--radius);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-muted);
		border: 1px solid var(--border);
		transition: all 0.15s;
	}

	.tab:hover {
		border-color: var(--accent);
	}

	.tab.active {
		background: var(--accent);
		color: var(--bg);
		border-color: var(--accent);
	}

	.leaderboard-container {
		text-align: left;
	}
</style>
