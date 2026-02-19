<script lang="ts">
	import '$lib/puzzles';
	import { getPuzzle } from '$lib/engine/registry';
	import { base } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import BookPromo from '$lib/components/BookPromo.svelte';

	afterNavigate(() => {
		requestAnimationFrame(() => {
			(document.querySelector('.grid-cell[data-row]') as HTMLElement)?.focus();
		});
	});

	const bases = ['binary', 'octal', 'decimal', 'hex', 'ascii'] as const;
	const labels: Record<string, string> = {
		binary: 'BIN',
		octal: 'OCT',
		decimal: 'DEC',
		hex: 'HEX',
		ascii: 'ASCII'
	};
	const icons: Record<string, string> = {
		binary: '0b',
		octal: '0o',
		decimal: '10',
		hex: '0x',
		ascii: 'Az'
	};

	// Map each pair of bases to a puzzle slug
	const slugMap: Record<string, string> = {
		'binary-decimal': 'binary-decimal',
		'decimal-binary': 'binary-decimal',
		'binary-octal': 'binary-octal',
		'octal-binary': 'binary-octal',
		'binary-hex': 'hex-binary',
		'hex-binary': 'hex-binary',
		'octal-decimal': 'octal-decimal',
		'decimal-octal': 'octal-decimal',
		'octal-hex': 'octal-hex',
		'hex-octal': 'octal-hex',
		'decimal-hex': 'hex-decimal',
		'hex-decimal': 'hex-decimal',
		'ascii-binary': 'ascii-binary',
		'binary-ascii': 'ascii-binary',
		'ascii-octal': 'ascii-octal',
		'octal-ascii': 'ascii-octal',
		'ascii-decimal': 'ascii-decimal',
		'decimal-ascii': 'ascii-decimal',
		'ascii-hex': 'ascii-hex',
		'hex-ascii': 'ascii-hex'
	};

	function getSlug(from: string, to: string): string | null {
		if (from === to) return null;
		return slugMap[`${from}-${to}`] ?? null;
	}

	function getPlugin(from: string, to: string) {
		const slug = getSlug(from, to);
		return slug ? getPuzzle(slug) : undefined;
	}

	function handleExprKeydown(e: KeyboardEvent) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		const cards = [...document.querySelectorAll('.expr-card')] as HTMLElement[];
		const idx = cards.indexOf(e.currentTarget as HTMLElement);
		const cols = 2;
		const row = Math.floor(idx / cols);
		const col = idx % cols;

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (row === 0) {
				(document.querySelector('.mixed-card') as HTMLElement)?.focus();
			} else {
				cards[idx - cols]?.focus();
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (idx + cols < cards.length) {
				cards[idx + cols].focus();
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			if (col > 0) cards[idx - 1].focus();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			if (col < cols - 1 && idx + 1 < cards.length) cards[idx + 1].focus();
		}
	}

	function handleGridKeydown(e: KeyboardEvent) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		const dirs: Record<string, [number, number]> = {
			ArrowUp: [-1, 0],
			ArrowDown: [1, 0],
			ArrowLeft: [0, -1],
			ArrowRight: [0, 1]
		};
		const dir = dirs[e.key];
		if (!dir) return;

		const cell = (e.target as HTMLElement).closest('[data-row]') as HTMLElement | null;
		if (!cell) return;

		e.preventDefault();
		let row = Number(cell.dataset.row);
		let col = Number(cell.dataset.col);
		const n = bases.length;

		// Step in direction, skipping disabled cells
		for (let i = 0; i < n; i++) {
			row = row + dir[0];
			col = col + dir[1];

			// Down past bottom row → mixed card
			if (row >= n && dir[0] === 1) {
				(document.querySelector('.mixed-card') as HTMLElement)?.focus();
				return;
			}

			// Wrap on edges
			row = (row + n) % n;
			col = (col + n) % n;

			if (row !== col) {
				const target = document.querySelector(
					`.grid-cell[data-row="${row}"][data-col="${col}"]`
				) as HTMLElement | null;
				target?.focus();
				return;
			}
		}
	}
</script>

<svelte:head>
	<title>Puzzles — Puzzle Games</title>
</svelte:head>

<div class="puzzles-page">
	<BookPromo variant="banner" />

	<h1>Choose a Puzzle</h1>
	<p class="subtitle">Pick two number systems to convert between</p>

	<div class="grid-wrapper">
		<!-- Column headers -->
		<div class="corner">
			<span class="corner-from">FROM</span>
			<span class="corner-to">TO</span>
			<div class="corner-line"></div>
		</div>
		{#each bases as colBase}
			<div class="col-header">
				<span class="header-icon mono">{icons[colBase]}</span>
				<span class="header-label">{labels[colBase]}</span>
			</div>
		{/each}

		<!-- Rows -->
		{#each bases as rowBase, ri}
			<div class="row-header">
				<span class="header-icon mono">{icons[rowBase]}</span>
				<span class="header-label">{labels[rowBase]}</span>
			</div>
			{#each bases as colBase, ci}
				{@const slug = getSlug(rowBase, colBase)}
				{@const plugin = getPlugin(rowBase, colBase)}
				{#if slug && plugin}
					<a
						href="{base}/puzzles/{slug}/"
						class="grid-cell"
						data-row={ri}
						data-col={ci}
						onkeydown={handleGridKeydown}
					>
						<span class="cell-arrow">{labels[rowBase]} ↔ {labels[colBase]}</span>
					</a>
				{:else}
					<div class="grid-cell disabled"></div>
				{/if}
			{/each}
		{/each}
	</div>

	<a
		href="{base}/puzzles/numeric-mixed/"
		class="mixed-card"
		onkeydown={(e) => {
			if (e.altKey || e.ctrlKey || e.metaKey) return;
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				const last = document.querySelector('.grid-cell[data-row="4"][data-col="3"]') as HTMLElement | null;
				last?.focus();
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				(document.querySelector('.expr-card') as HTMLElement)?.focus();
			}
		}}
	>
		<span class="mixed-title">Numeric Mixed</span>
		<span class="mixed-desc">Random mix of binary, octal, decimal &amp; hex conversions</span>
	</a>

	<h2 class="section-header">Computation Puzzles</h2>
	<p class="section-subtitle">Evaluate expressions and perform binary arithmetic</p>

	<div class="expr-grid">
		<a href="{base}/puzzles/rpn-eval/" class="expr-card" onkeydown={handleExprKeydown}>
			<span class="expr-title">RPN Evaluation</span>
			<span class="expr-example mono">3 4 + 2 *</span>
			<span class="expr-desc">Evaluate postfix (Reverse Polish) notation expressions</span>
		</a>
		<a href="{base}/puzzles/sexpr-eval/" class="expr-card" onkeydown={handleExprKeydown}>
			<span class="expr-title">S-Expression Evaluation</span>
			<span class="expr-example mono">(* (+ 3 4) 2)</span>
			<span class="expr-desc">Evaluate prefix S-expression notation expressions</span>
		</a>
		<a href="{base}/puzzles/truth-table/" class="expr-card" onkeydown={handleExprKeydown}>
			<span class="expr-title">Truth Tables</span>
			<span class="expr-example mono">A AND (B OR C)</span>
			<span class="expr-desc">Evaluate boolean logic expressions with variable assignments</span>
		</a>
		<a href="{base}/puzzles/binary-add/" class="expr-card" onkeydown={handleExprKeydown}>
			<span class="expr-title">Binary Addition</span>
			<span class="expr-example mono">1011 + 0110</span>
			<span class="expr-desc">Add two binary numbers and compute the sum in binary</span>
		</a>
	</div>
</div>

<style>
	.puzzles-page {
		text-align: center;
		max-width: 650px;
		margin: 0 auto;
	}

	.puzzles-page h1 {
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 0.95rem;
		margin-bottom: 2rem;
	}

	.grid-wrapper {
		display: grid;
		grid-template-columns: auto repeat(5, 1fr);
		grid-template-rows: auto repeat(5, 1fr);
		gap: 6px;
	}

	/* Corner cell with diagonal FROM/TO */
	.corner {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		min-width: 70px;
		min-height: 70px;
	}

	.corner-from {
		position: absolute;
		bottom: 6px;
		left: 6px;
		font-size: 0.6rem;
		font-weight: 700;
		color: var(--text-dim);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.corner-to {
		position: absolute;
		top: 6px;
		right: 8px;
		font-size: 0.6rem;
		font-weight: 700;
		color: var(--text-dim);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.corner-line {
		position: absolute;
		top: 0;
		left: 0;
		width: 141%;
		height: 1px;
		background: var(--border);
		transform-origin: top left;
		transform: rotate(45deg);
	}

	/* Headers */
	.col-header, .row-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
		padding: 0.5rem;
	}

	.header-icon {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--accent);
	}

	.header-label {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-muted);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	/* Grid cells */
	.grid-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-height: 70px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s;
	}

	.grid-cell:hover:not(.disabled),
	.grid-cell:focus-visible {
		border-color: var(--accent);
		background: var(--bg-elevated);
		transform: scale(1.05);
		text-decoration: none;
		outline: none;
		box-shadow: 0 0 0 2px var(--accent), 0 0 12px rgba(34, 211, 238, 0.3);
	}

	.grid-cell.disabled {
		background: transparent;
		border-color: transparent;
		cursor: default;
	}

	.cell-arrow {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		letter-spacing: 0.02em;
	}

	.grid-cell:hover:not(.disabled) .cell-arrow,
	.grid-cell:focus-visible .cell-arrow {
		color: var(--accent);
	}

	/* Mixed mode card */
	.mixed-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s;
	}

	.mixed-card:hover,
	.mixed-card:focus-visible {
		border-color: var(--accent);
		background: var(--bg-elevated);
		transform: scale(1.02);
		text-decoration: none;
		outline: none;
		box-shadow: 0 0 0 2px var(--accent), 0 0 12px rgba(34, 211, 238, 0.3);
	}

	.mixed-title {
		font-family: var(--font-mono);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--accent);
	}

	.mixed-desc {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	/* Expression Puzzles section */
	.section-header {
		margin-top: 2.5rem;
		margin-bottom: 0.5rem;
		font-size: 1.3rem;
	}

	.section-subtitle {
		color: var(--text-muted);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.expr-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.expr-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s;
	}

	.expr-card:hover,
	.expr-card:focus-visible {
		border-color: var(--accent);
		background: var(--bg-elevated);
		transform: scale(1.02);
		text-decoration: none;
		outline: none;
		box-shadow: 0 0 0 2px var(--accent), 0 0 12px rgba(34, 211, 238, 0.3);
	}

	.expr-title {
		font-family: var(--font-mono);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--accent);
	}

	.expr-example {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text);
		letter-spacing: 0.05em;
	}

	.expr-desc {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-align: center;
	}
</style>
