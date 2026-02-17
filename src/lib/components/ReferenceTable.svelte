<script lang="ts">
	let { variant = 'numeric' }: { variant?: 'numeric' | 'ascii' } = $props();

	const numericRows = Array.from({ length: 17 }, (_, i) => ({
		dec: i.toString(),
		bin: i.toString(2).padStart(4, '0'),
		oct: i.toString(8),
		hex: i.toString(16).toUpperCase()
	}));

	const asciiRows = Array.from({ length: 26 }, (_, i) => {
		const code = 65 + i;
		return {
			char: String.fromCharCode(code),
			dec: code.toString(),
			hex: code.toString(16).toUpperCase(),
			oct: code.toString(8),
			bin: code.toString(2).padStart(8, '0')
		};
	});
</script>

<div class="reference-table">
	<table>
		{#if variant === 'ascii'}
			<thead>
				<tr>
					<th>Char</th>
					<th>Dec</th>
					<th>Hex</th>
					<th>Oct</th>
					<th>Bin</th>
				</tr>
			</thead>
			<tbody>
				{#each asciiRows as row}
					<tr>
						<td class="mono">{row.char}</td>
						<td class="mono">{row.dec}</td>
						<td class="mono">{row.hex}</td>
						<td class="mono">{row.oct}</td>
						<td class="mono">{row.bin}</td>
					</tr>
				{/each}
			</tbody>
		{:else}
			<thead>
				<tr>
					<th>Dec</th>
					<th>Bin</th>
					<th>Oct</th>
					<th>Hex</th>
				</tr>
			</thead>
			<tbody>
				{#each numericRows as row}
					<tr>
						<td class="mono">{row.dec}</td>
						<td class="mono">{row.bin}</td>
						<td class="mono">{row.oct}</td>
						<td class="mono">{row.hex}</td>
					</tr>
				{/each}
			</tbody>
		{/if}
	</table>
</div>

<style>
	.reference-table {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.75rem;
		max-width: 340px;
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
