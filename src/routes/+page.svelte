<script lang="ts">
	import { base } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import BookPromo from '$lib/components/BookPromo.svelte';

	afterNavigate(() => {
		requestAnimationFrame(() => {
			(document.querySelector('.cta .btn-primary') as HTMLElement)?.focus();
		});
	});

	function ctaArrow(e: KeyboardEvent) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		const isArrow = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key);
		if (!isArrow) return;
		e.preventDefault();
		const btns = [...document.querySelectorAll('.cta .btn')] as HTMLElement[];
		const idx = btns.indexOf(e.currentTarget as HTMLElement);
		btns[(idx + 1) % btns.length]?.focus();
	}
</script>

<svelte:head>
	<title>Puzzle Games — Train Your Brain</title>
</svelte:head>

<div class="landing">
	<div class="hero">
		<h1><img src="{base}/logo.png" alt="" class="hero-logo" /> Puzzle Games</h1>
		<p class="subtitle">Sharpen your skills with timed programming puzzles.<br />Compete on the leaderboard. Level up.</p>
		<div class="cta">
			<a href="{base}/puzzles/" class="btn btn-primary btn-lg" onkeydown={ctaArrow}>Play Now</a>
			<a href="{base}/leaderboard/" class="btn btn-secondary btn-lg" onkeydown={ctaArrow}>Leaderboard</a>
		</div>
	</div>

	<BookPromo variant="banner" />

	<div class="features">
		<div class="feature card">
			<div class="feature-icon">⏱️</div>
			<h3>Timed Challenges</h3>
			<p>Race against the clock. Faster answers earn more points.</p>
		</div>
		<div class="feature card">
			<div class="feature-icon">📈</div>
			<h3>Adaptive Difficulty</h3>
			<p>Puzzles get harder as you improve. Streak-based progression.</p>
		</div>
		<div class="feature card">
			<div class="feature-icon">🏆</div>
			<h3>Leaderboards</h3>
			<p>Compete for the top spot. Best scores per puzzle type.</p>
		</div>
	</div>
</div>

<style>
	.landing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3rem;
		padding-top: 3rem;
	}

	.hero {
		text-align: center;
	}

	.hero h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.hero-logo {
		height: 1em;
		width: auto;
		vertical-align: -0.1em;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 1.15rem;
		line-height: 1.8;
	}

	.cta {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.btn-lg {
		padding: 0.8rem 2rem;
		font-size: 1rem;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
		width: 100%;
		max-width: 800px;
	}

	.feature {
		text-align: center;
	}

	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
	}

	.feature h3 {
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
	}

	.feature p {
		color: var(--text-muted);
		font-size: 0.9rem;
	}
</style>
