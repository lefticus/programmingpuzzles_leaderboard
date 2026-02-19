<script lang="ts">
	import '$lib/puzzles';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { supabase } from '$lib/supabase';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount, tick } from 'svelte';

	const modes = [
		{ key: 'sprint', label: 'Sprint' },
		{ key: 'marathon', label: 'Marathon' },
		{ key: 'untimed', label: 'Untimed' }
	] as const;

	const conversionPuzzles = [
		{ slug: 'binary-decimal', name: 'Binary ↔ Decimal' },
		{ slug: 'hex-binary', name: 'Hex ↔ Binary' },
		{ slug: 'hex-decimal', name: 'Hex ↔ Decimal' },
		{ slug: 'binary-octal', name: 'Binary ↔ Octal' },
		{ slug: 'octal-hex', name: 'Octal ↔ Hex' },
		{ slug: 'octal-decimal', name: 'Octal ↔ Decimal' },
		{ slug: 'ascii-binary', name: 'ASCII ↔ Binary' },
		{ slug: 'ascii-decimal', name: 'ASCII ↔ Decimal' },
		{ slug: 'ascii-hex', name: 'ASCII ↔ Hex' },
		{ slug: 'ascii-octal', name: 'ASCII ↔ Octal' },
		{ slug: 'numeric-mixed', name: 'Numeric Mixed' }
	];

	const computationPuzzles = [
		{ slug: 'rpn-eval', name: 'RPN Evaluation' },
		{ slug: 'sexpr-eval', name: 'S-Expression Evaluation' },
		{ slug: 'truth-table', name: 'Truth Tables' },
		{ slug: 'binary-add', name: 'Binary Addition' }
	];

	const allSlugs = new Set([...conversionPuzzles, ...computationPuzzles].map(p => p.slug));

	const expandedPuzzle = $derived.by(() => {
		const param = page.url.searchParams.get('puzzle');
		return param && allSlugs.has(param) ? param : null;
	});

	async function togglePuzzle(slug: string) {
		if (expandedPuzzle === slug) {
			goto(`${base}/leaderboard/`, { replaceState: false, keepFocus: true, noScroll: true });
		} else {
			goto(`${base}/leaderboard/?puzzle=${slug}`, { replaceState: false, keepFocus: true, noScroll: true });
			await tick();
			document.getElementById(`puzzle-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	let topLeaders = $state<Array<{ rank: number; display_name: string; total_score: number }>>([]);
	let leadersLoading = $state(true);
	let leadersError = $state('');

	onMount(async () => {
		const { data, error } = await supabase.rpc('get_top_leaders', { p_limit: 10 });
		if (error) {
			leadersError = error.message;
		} else {
			topLeaders = data ?? [];
		}
		leadersLoading = false;
	});

	function medalClass(rank: number): string {
		if (rank === 1) return 'gold';
		if (rank === 2) return 'silver';
		if (rank === 3) return 'bronze';
		return '';
	}
</script>

<svelte:head>
	<title>Leaderboard — Puzzle Games</title>
</svelte:head>

<div class="leaderboard-page">
	<h1>Leaderboard</h1>

	<!-- Top Leaders -->
	<section class="top-leaders card">
		<h2>Top Leaders</h2>
		{#if leadersLoading}
			<p class="status-text">Loading...</p>
		{:else if leadersError}
			<p class="status-text error">{leadersError}</p>
		{:else if topLeaders.length === 0}
			<p class="status-text">No scores yet.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th class="rank-col">#</th>
						<th>Player</th>
						<th class="num-col">Total Score</th>
					</tr>
				</thead>
				<tbody>
					{#each topLeaders as leader}
						<tr class={medalClass(leader.rank)}>
							<td class="rank-col mono">{leader.rank}</td>
							<td>{leader.display_name}</td>
							<td class="num-col mono">{leader.total_score.toLocaleString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	<!-- Conversion Puzzles -->
	<section class="puzzle-section">
		<h2>Conversion Puzzles</h2>
		{#each conversionPuzzles as puzzle}
			<button
				id="puzzle-{puzzle.slug}"
				class="puzzle-row"
				class:active={expandedPuzzle === puzzle.slug}
				onclick={() => togglePuzzle(puzzle.slug)}
			>
				<span class="puzzle-name">{puzzle.name}</span>
				<span class="chevron">{expandedPuzzle === puzzle.slug ? '▲' : '▼'}</span>
			</button>
			{#if expandedPuzzle === puzzle.slug}
				<div class="mode-tables">
					{#each modes as mode}
						<div class="mode-table card">
							<Leaderboard
								puzzleSlug="{puzzle.slug}-{mode.key}"
								limit={50}
								title={mode.label}
							/>
						</div>
					{/each}
				</div>
			{/if}
		{/each}
	</section>

	<!-- Computation Puzzles -->
	<section class="puzzle-section">
		<h2>Computation Puzzles</h2>
		{#each computationPuzzles as puzzle}
			<button
				id="puzzle-{puzzle.slug}"
				class="puzzle-row"
				class:active={expandedPuzzle === puzzle.slug}
				onclick={() => togglePuzzle(puzzle.slug)}
			>
				<span class="puzzle-name">{puzzle.name}</span>
				<span class="chevron">{expandedPuzzle === puzzle.slug ? '▲' : '▼'}</span>
			</button>
			{#if expandedPuzzle === puzzle.slug}
				<div class="mode-tables">
					{#each modes as mode}
						<div class="mode-table card">
							<Leaderboard
								puzzleSlug="{puzzle.slug}-{mode.key}"
								limit={50}
								title={mode.label}
							/>
						</div>
					{/each}
				</div>
			{/if}
		{/each}
	</section>
</div>

<style>
	.leaderboard-page {
		max-width: 1100px;
		margin: 0 auto;
	}

	.leaderboard-page h1 {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	/* Top Leaders */
	.top-leaders {
		margin-bottom: 2rem;
		text-align: left;
	}

	.top-leaders h2 {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 1.3rem;
	}

	.top-leaders table {
		width: 100%;
		border-collapse: collapse;
	}

	.top-leaders th {
		text-align: left;
		padding: 0.6rem 0.8rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-dim);
		border-bottom: 1px solid var(--border);
	}

	.top-leaders td {
		padding: 0.6rem 0.8rem;
		font-size: 0.9rem;
		border-bottom: 1px solid var(--border);
	}

	.top-leaders tr:hover td {
		background: var(--bg-elevated);
	}

	.rank-col {
		width: 40px;
		text-align: center;
	}

	.num-col {
		text-align: right;
	}

	.top-leaders tr.gold td {
		background: rgba(255, 215, 0, 0.1);
		border-left: 3px solid #ffd700;
	}

	.top-leaders tr.silver td {
		background: rgba(192, 192, 192, 0.1);
		border-left: 3px solid #c0c0c0;
	}

	.top-leaders tr.bronze td {
		background: rgba(205, 127, 50, 0.1);
		border-left: 3px solid #cd7f32;
	}

	.status-text {
		text-align: center;
		color: var(--text-muted);
		padding: 2rem;
	}

	.status-text.error {
		color: var(--error);
	}

	/* Puzzle Sections */
	.puzzle-section {
		margin-bottom: 2rem;
	}

	.puzzle-section h2 {
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.puzzle-row {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		margin-bottom: 0.25rem;
		cursor: pointer;
		transition: all 0.15s;
		background: transparent;
	}

	.puzzle-row:hover {
		border-color: var(--accent);
		background: var(--bg-elevated);
	}

	.puzzle-row.active {
		background: var(--accent);
		color: var(--bg);
		border-color: var(--accent);
	}

	.chevron {
		font-size: 0.7rem;
	}

	/* Mode Tables Grid */
	.mode-tables {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		margin: 0.5rem 0 0.75rem;
	}

	.mode-table {
		min-width: 0;
		overflow-x: auto;
	}

	@media (max-width: 800px) {
		.mode-tables {
			grid-template-columns: 1fr;
		}
	}
</style>
