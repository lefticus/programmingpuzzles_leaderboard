<script lang="ts">
	import '$lib/puzzles';
	import { page } from '$app/state';
	import { getPuzzle } from '$lib/engine/registry';
	import type { GameMode } from '$lib/engine/types';
	import GameShell from '$lib/components/GameShell.svelte';
	import BookPromo from '$lib/components/BookPromo.svelte';
	import { base } from '$app/paths';

	const validModes: GameMode[] = ['sprint', 'marathon', 'untimed'];

	const slug = $derived(page.params.slug ?? '');
	const rawMode = $derived(page.params.mode);
	const initialMode = $derived(
		rawMode && validModes.includes(rawMode as GameMode) ? (rawMode as GameMode) : undefined
	);
	const invalidMode = $derived(rawMode !== undefined && initialMode === undefined);
	const plugin = $derived(getPuzzle(slug));
</script>

<svelte:head>
	<title>{plugin ? plugin.name : 'Not Found'} — Puzzle Games</title>
</svelte:head>

{#if !plugin || invalidMode}
	<div class="not-found">
		<h2>{invalidMode ? 'Invalid mode' : 'Puzzle not found'}</h2>
		<p>{invalidMode ? `"${rawMode}" is not a valid game mode.` : `The puzzle "${slug}" doesn't exist.`}</p>
		<a href="{base}/puzzles/{invalidMode ? slug + '/' : ''}" class="btn btn-primary">
			{invalidMode ? 'Back to Puzzle' : 'Back to Puzzles'}
		</a>
	</div>
{:else}
	<div class="puzzle-page-promo"><BookPromo variant="banner" /></div>
	{#key `${slug}/${initialMode ?? ''}`}
		<GameShell {plugin} {initialMode} />
	{/key}
{/if}

<style>
	.puzzle-page-promo {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

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
