<script lang="ts">
	import { base } from '$app/paths';

	let { variant = 'banner' }: { variant?: 'banner' | 'compact' } = $props();
</script>

<div class="book-promo {variant}">
	<img src="{base}/book-cover.png" alt="Programming Puzzles Big Book cover" class="book-cover" />
	<div class="book-info">
		<p class="tagline">Check out Jason's puzzle book for puzzles like these and more!</p>
		<div class="book-links">
			<a href="https://amzn.to/3ZFbTQl" target="_blank" rel="noopener" class="book-link">
				Amazon <span class="badge">Print</span>
			</a>
			<a href="https://www.barnesandnoble.com/w/programming-puzzles-big-book-jason-turner/1149491488" target="_blank" rel="noopener" class="book-link">
				Barnes &amp; Noble <span class="badge">Print</span>
			</a>
			<a href="https://leanpub.com/programming_puzzles_for_everyone/" target="_blank" rel="noopener" class="book-link">
				Leanpub <span class="badge">eBook</span>
			</a>
		</div>
	</div>
</div>

<style>
	.book-promo {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg, 12px);
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.book-cover {
		border-radius: 6px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.book-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.tagline {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text);
		margin: 0;
	}

	.book-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.book-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--bg-surface, var(--bg));
		color: var(--text);
		font-size: 0.85rem;
		font-weight: 500;
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s;
		width: fit-content;
	}

	.book-link:hover {
		border-color: var(--accent);
		background: var(--bg-elevated);
	}

	.badge {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--accent);
		background: rgba(34, 211, 238, 0.1);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
	}

	/* Banner variant — wide, horizontal */
	.banner {
		max-width: 800px;
		width: 100%;
	}

	.banner .book-cover {
		width: 120px;
		height: auto;
	}

	/* Compact variant — smaller, single column */
	.compact {
		flex-direction: column;
		text-align: center;
		max-width: 300px;
		padding: 1.25rem;
	}

	.compact .book-cover {
		width: 80px;
		height: auto;
	}

	.compact .book-info {
		align-items: center;
	}

	.compact .tagline {
		font-size: 0.95rem;
	}

	.compact .book-link {
		font-size: 0.8rem;
	}

	/* Responsive: stack banner on narrow screens */
	@media (max-width: 500px) {
		.banner {
			flex-direction: column;
			text-align: center;
		}

		.banner .book-info {
			align-items: center;
		}
	}
</style>
