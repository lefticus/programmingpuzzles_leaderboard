<script lang="ts">
	import '$lib/puzzles';
	import { page } from '$app/state';
	import { getPuzzle } from '$lib/engine/registry';
	import GameShell from '$lib/components/GameShell.svelte';
	import { base } from '$app/paths';

	const slug = $derived(page.params.slug);
	const plugin = $derived(getPuzzle(slug));
</script>

<svelte:head>
	<title>{plugin ? plugin.name : 'Not Found'} — Puzzle Games</title>
</svelte:head>

{#if plugin}
	{#key slug}
		<GameShell {plugin} />
	{/key}
{:else}
	<div class="not-found">
		<h2>Puzzle not found</h2>
		<p>The puzzle "{slug}" doesn't exist.</p>
		<a href="{base}/puzzles/" class="btn btn-primary">Back to Puzzles</a>
	</div>
{/if}

<style>
	.not-found {
		text-align: center;
		padding-top: 3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.not-found p {
		color: var(--text-muted);
	}
</style>
