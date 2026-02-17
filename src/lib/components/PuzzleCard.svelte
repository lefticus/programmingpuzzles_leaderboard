<script lang="ts">
	import type { PuzzlePlugin } from '$lib/engine/types';
	import { base } from '$app/paths';

	let { plugin }: { plugin: PuzzlePlugin } = $props();
</script>

<a href="{base}/puzzles/{plugin.slug}/" class="puzzle-card card">
	<h3>{plugin.name}</h3>
	<p>{plugin.description}</p>
	<div class="card-meta">
		{plugin.difficultyLabel(plugin.minDifficulty)} — {plugin.difficultyLabel(plugin.maxDifficulty)}
	</div>
</a>

<style>
	.puzzle-card {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: var(--text);
		transition: border-color 0.15s, transform 0.15s;
	}

	.puzzle-card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.puzzle-card h3 {
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
	}

	.puzzle-card p {
		color: var(--text-muted);
		font-size: 0.85rem;
		flex: 1;
	}

	.card-meta {
		margin-top: 0.75rem;
		font-size: 0.75rem;
		color: var(--text-dim);
		font-family: var(--font-mono);
	}
</style>
