<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import AuthButton from '$lib/components/AuthButton.svelte';

	let { children } = $props();
</script>

<div class="app-layout">
	<nav class="navbar">
		<div class="nav-content">
			<a href="{base}/" class="nav-brand">
				<img src="{base}/logo.png" alt="" class="brand-icon" />
				<span class="brand-text">Puzzle Games</span>
			</a>
			<div class="nav-links">
				<a href="{base}/puzzles/">Puzzles</a>
				<a href="{base}/leaderboard/">Leaderboard</a>
			</div>
			<AuthButton />
		</div>
	</nav>
	<div class="test-banner">
		This site is in testing — scores may be reset. <a href="https://github.com/lefticus/programmingpuzzles_leaderboard/issues" target="_blank" rel="noopener">Submit feedback or requests</a>
	</div>
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.navbar {
		background: var(--bg-surface);
		border-bottom: 1px solid var(--border);
		padding: 0 1.5rem;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		height: 3.5rem;
		gap: 2rem;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--text);
		text-decoration: none;
	}

	.brand-icon {
		height: 1.4rem;
		width: auto;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
		flex: 1;
	}

	.nav-links a {
		color: var(--text-muted);
		font-weight: 500;
		font-size: 0.9rem;
		transition: color 0.15s;
	}

	.nav-links a:hover {
		color: var(--text);
		text-decoration: none;
	}

	.test-banner {
		background: #854d0e44;
		border-bottom: 1px solid #854d0e;
		color: #fbbf24;
		text-align: center;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
	}

	.test-banner a {
		color: #fde68a;
		font-weight: 600;
		text-decoration: underline;
	}

	.main-content {
		flex: 1;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}
</style>
