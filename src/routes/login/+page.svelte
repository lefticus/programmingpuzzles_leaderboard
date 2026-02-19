<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	let method = $state<'magic' | 'password'>('magic');
	let mode = $state<'signin' | 'signup'>('signin');
	let email = $state('');
	let password = $state('');
	let displayName = $state('');
	let error = $state('');
	let loading = $state(false);
	let magicLinkSent = $state(false);

	async function handleMagicLink(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const { error: err } = await auth.signInWithMagicLink(email);
			if (err) {
				error = err.message;
			} else {
				magicLinkSent = true;
			}
		} finally {
			loading = false;
		}
	}

	async function handlePassword(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			if (mode === 'signup') {
				const { error: err } = await auth.signUpWithEmail(email, password, displayName);
				if (err) { error = err.message; return; }
			} else {
				const { error: err } = await auth.signInWithEmail(email, password);
				if (err) { error = err.message; return; }
			}
			goto(`${base}/puzzles/`);
		} finally {
			loading = false;
		}
	}

	async function handleOAuth(provider: 'github' | 'google') {
		const { error: err } = await auth.signInWithOAuth(provider);
		if (err) error = err.message;
	}
</script>

<svelte:head>
	<title>Sign In — Puzzle Games</title>
</svelte:head>

<div class="login-page">
	<div class="login-card card">
		<h2>Sign In</h2>

		{#if error}
			<div class="error-msg">{error}</div>
		{/if}

		{#if magicLinkSent}
			<div class="success-msg">
				Check your email for a sign-in link! You can close this page.
			</div>
		{:else}
			<!-- Method toggle -->
			<div class="method-toggle">
				<button
					class="method-btn"
					class:active={method === 'magic'}
					onclick={() => method = 'magic'}
				>Email Link</button>
				<button
					class="method-btn"
					class:active={method === 'password'}
					onclick={() => method = 'password'}
				>Password</button>
			</div>

			{#if method === 'magic'}
				<form onsubmit={handleMagicLink}>
					<label class="field">
						<span>Email</span>
						<input type="email" bind:value={email} required placeholder="you@example.com" />
					</label>

					<button type="submit" class="btn btn-primary full-width" disabled={loading}>
						{loading ? 'Sending...' : 'Send Sign-In Link'}
					</button>
				</form>

				<p class="method-hint">We'll email you a link — no password needed.</p>
			{:else}
				{#if mode === 'signup'}
					<p class="method-hint">Create an account with email and password.</p>
				{/if}

				<form onsubmit={handlePassword}>
					{#if mode === 'signup'}
						<label class="field">
							<span>Display Name</span>
							<input type="text" bind:value={displayName} required placeholder="PlayerOne" />
						</label>
					{/if}

					<label class="field">
						<span>Email</span>
						<input type="email" bind:value={email} required placeholder="you@example.com" />
					</label>

					<label class="field">
						<span>Password</span>
						<input type="password" bind:value={password} required minlength="6" placeholder="••••••••" />
					</label>

					<button type="submit" class="btn btn-primary full-width" disabled={loading}>
						{loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
					</button>
				</form>

				<p class="toggle-mode">
					{#if mode === 'signin'}
						Don't have an account? <button class="link-btn" onclick={() => mode = 'signup'}>Sign up</button>
					{:else}
						Already have an account? <button class="link-btn" onclick={() => mode = 'signin'}>Sign in</button>
					{/if}
				</p>
			{/if}

			<div class="divider"><span>or</span></div>

			<div class="oauth-buttons">
				<button class="btn btn-secondary full-width" onclick={() => handleOAuth('github')}>
					Continue with GitHub
				</button>
				<button class="btn btn-secondary full-width" onclick={() => handleOAuth('google')}>
					Continue with Google
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		padding-top: 3rem;
	}

	.login-card {
		width: 100%;
		max-width: 420px;
	}

	.login-card h2 {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.method-toggle {
		display: flex;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		margin-bottom: 1.25rem;
	}

	.method-btn {
		flex: 1;
		padding: 0.5rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.15s;
	}

	.method-btn.active {
		background: var(--accent);
		color: var(--bg);
	}

	.method-hint {
		text-align: center;
		color: var(--text-dim);
		font-size: 0.8rem;
		margin-top: 0.75rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 1rem;
	}

	.field span {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-muted);
	}

	.field input {
		padding: 0.6rem 0.8rem;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 0.95rem;
	}

	.field input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.full-width {
		width: 100%;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 1.25rem 0;
		color: var(--text-dim);
		font-size: 0.85rem;
	}

	.divider::before, .divider::after {
		content: '';
		flex: 1;
		border-top: 1px solid var(--border);
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.error-msg {
		background: #991b1b33;
		border: 1px solid #991b1b;
		color: var(--error);
		padding: 0.6rem 0.8rem;
		border-radius: var(--radius);
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}

	.success-msg {
		background: #16653433;
		border: 1px solid #166534;
		color: #4ade80;
		padding: 1rem;
		border-radius: var(--radius);
		font-size: 0.95rem;
		text-align: center;
	}

	.toggle-mode {
		text-align: center;
		margin-top: 0.75rem;
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.link-btn {
		color: var(--accent);
		font-weight: 600;
		font-size: 0.85rem;
	}

	.link-btn:hover {
		text-decoration: underline;
	}
</style>
