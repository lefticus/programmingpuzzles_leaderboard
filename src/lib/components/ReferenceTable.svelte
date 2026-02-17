<script lang="ts">
	const rows = Array.from({ length: 17 }, (_, i) => ({
		dec: i.toString(),
		bin: i.toString(2).padStart(4, '0'),
		oct: i.toString(8),
		hex: i.toString(16).toUpperCase()
	}));
</script>

<div class="reference-table">
	<table>
		<thead>
			<tr>
				<th>Dec</th>
				<th>Bin</th>
				<th>Oct</th>
				<th>Hex</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td class="mono">{row.dec}</td>
					<td class="mono">{row.bin}</td>
					<td class="mono">{row.oct}</td>
					<td class="mono">{row.hex}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.reference-table {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.75rem;
		max-width: 280px;
		margin: 0 auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: center;
		padding: 0.3rem 0.5rem;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-dim);
		border-bottom: 1px solid var(--border);
	}

	td {
		text-align: center;
		padding: 0.2rem 0.5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		border-bottom: 1px solid var(--bg-elevated);
	}

	tr:hover td {
		background: var(--bg-elevated);
		color: var(--text);
	}
</style>
