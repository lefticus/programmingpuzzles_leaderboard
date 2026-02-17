<script lang="ts">
	import '$lib/puzzles';
	import { getAllPuzzles } from '$lib/engine/registry';
	import PuzzleCard from '$lib/components/PuzzleCard.svelte';

	const puzzles = getAllPuzzles();
</script>

<svelte:head>
	<title>Puzzles — Puzzle Games</title>
</svelte:head>

<div class="puzzles-page">
	<h1>Choose a Puzzle</h1>
	<div class="puzzle-grid">
		{#each puzzles as plugin}
			<PuzzleCard {plugin} />
		{/each}
	</div>
</div>

<style>
	.puzzles-page {
		text-align: center;
	}

	.puzzles-page h1 {
		margin-bottom: 2rem;
	}

	.puzzle-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		max-width: 900px;
		margin: 0 auto;
	}
</style>
