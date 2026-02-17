<script lang="ts">
	import '$lib/puzzles';
	import { getAllPuzzles } from '$lib/engine/registry';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	const puzzles = getAllPuzzles();
	const modes = [
		{ key: 'sprint', label: 'Sprint', icon: '⚡' },
		{ key: 'marathon', label: 'Marathon', icon: '🏔️' },
		{ key: 'untimed', label: 'Untimed', icon: '🧘' }
	] as const;

	const tabs = puzzles.flatMap(p =>
		modes.map(m => ({
			slug: `${p.slug}-${m.key}`,
			label: `${p.icon} ${p.name}`,
			modeLabel: `${m.icon} ${m.label}`
		}))
	);

	const tabSlugs = new Set(tabs.map(t => t.slug));
	const defaultSlug = tabs.length > 0 ? tabs[0].slug : '';

	const selectedSlug = $derived.by(() => {
		const param = page.url.searchParams.get('puzzle');
		return param && tabSlugs.has(param) ? param : defaultSlug;
	});

	function selectTab(slug: string) {
		goto(`${base}/leaderboard/?puzzle=${slug}`, { replaceState: false, keepFocus: true });
	}
</script>

<svelte:head>
	<title>Leaderboard — Puzzle Games</title>
</svelte:head>

<div class="leaderboard-page">
	<h1>Leaderboard</h1>

	<div class="puzzle-tabs">
		{#each tabs as tab}
			<button
				class="tab"
				class:active={selectedSlug === tab.slug}
				onclick={() => selectTab(tab.slug)}
			>
				{tab.label} {tab.modeLabel}
			</button>
		{/each}
	</div>

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
