<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	let { puzzleSlug = '', limit = 20, title = 'Leaderboard', highlightUserId = '' }: { puzzleSlug?: string; limit?: number; title?: string; highlightUserId?: string } = $props();

	let entries = $state<Array<{
		rank: number;
		user_id: string;
		display_name: string;
		score: number;
		max_difficulty: number;
		rounds_played: number;
		created_at: string;
	}>>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		fetchLeaderboard();
	});

	async function fetchLeaderboard() {
		loading = true;
		error = '';

		const { data, error: err } = await supabase.rpc('get_leaderboard', {
			p_slug: puzzleSlug || null,
			p_limit: limit
		});

		if (err) {
			error = err.message;
		} else {
			entries = data ?? [];
		}
		loading = false;
	}
</script>

<div class="leaderboard">
	<h3>{title}</h3>

	{#if loading}
		<p class="loading-text">Loading...</p>
	{:else if error}
		<p class="error-text">{error}</p>
	{:else if entries.length === 0}
		<p class="empty-text">No scores yet. Be the first!</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th class="rank-col">#</th>
					<th>Player</th>
					<th class="num-col">Score</th>
					<th class="num-col">Max Diff.</th>
					<th class="num-col">Rounds</th>
				</tr>
			</thead>
			<tbody>
				{#each entries as entry}
					<tr class:highlight={highlightUserId && entry.user_id === highlightUserId}>
						<td class="rank-col mono">{entry.rank}</td>
						<td>{entry.display_name}</td>
						<td class="num-col mono">{entry.score.toLocaleString()}</td>
						<td class="num-col mono">{entry.max_difficulty}</td>
						<td class="num-col mono">{entry.rounds_played}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.leaderboard {
		width: 100%;
	}

	.leaderboard h3 {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.6rem 0.8rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-dim);
		border-bottom: 1px solid var(--border);
	}

	td {
		padding: 0.6rem 0.8rem;
		font-size: 0.9rem;
		border-bottom: 1px solid var(--border);
	}

	.rank-col {
		width: 40px;
		text-align: center;
	}

	.num-col {
		text-align: right;
	}

	tr:hover td {
		background: var(--bg-elevated);
	}

	tr.highlight td {
		background: rgba(34, 211, 238, 0.08);
		border-left: 3px solid var(--accent);
	}

	tr.highlight:first-child td {
		border-left: 3px solid var(--accent);
	}

	.loading-text, .error-text, .empty-text {
		text-align: center;
		color: var(--text-muted);
		padding: 2rem;
	}

	.error-text {
		color: var(--error);
	}
</style>
