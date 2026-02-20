<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	let email = $state('');
	let password = $state('');
	let displayName = $state('');
	let error = $state('');
	let loading = $state(false);
	let magicLinkSent = $state(false);
	let showPassword = $state(false);
	let passwordMode = $state<'signin' | 'signup'>('signin');
	let nameStatus = $state<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
	let nameDebounce: ReturnType<typeof setTimeout>;

	function handleNameInput() {
		clearTimeout(nameDebounce);
		if (displayName.length < 2 || displayName.length > 20) {
			nameStatus = displayName.length > 0 ? 'invalid' : 'idle';
			return;
		}
		nameStatus = 'checking';
		nameDebounce = setTimeout(async () => {
			const available = await auth.checkDisplayName(displayName);
			nameStatus = available ? 'available' : 'taken';
		}, 300);
	}

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
		if (passwordMode === 'signup' && nameStatus !== 'available') {
			error = 'Please choose an available display name.';
			return;
		}
		loading = true;

		try {
			if (passwordMode === 'signup') {
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

			{#if !showPassword}
				<p class="password-toggle">
					Prefer a password? <button class="link-btn" onclick={() => showPassword = true}>Use email &amp; password</button>
				</p>
			{:else}
				<div class="divider"><span>or use a password</span></div>

				<form onsubmit={handlePassword}>
					{#if passwordMode === 'signup'}
						<label class="field">
							<span>Display Name</span>
							<input type="text" bind:value={displayName} oninput={handleNameInput} required minlength="2" maxlength="20" placeholder="PlayerOne" />
						</label>
						{#if nameStatus === 'checking'}
							<p class="name-status checking">Checking...</p>
						{:else if nameStatus === 'available'}
							<p class="name-status available">Available</p>
						{:else if nameStatus === 'taken'}
							<p class="name-status taken">Taken</p>
						{:else if nameStatus === 'invalid'}
							<p class="name-status taken">Must be 2-20 characters</p>
						{/if}
					{/if}

					<label class="field">
						<span>Email</span>
						<input type="email" bind:value={email} required placeholder="you@example.com" />
					</label>

					<label class="field">
						<span>Password</span>
						<input type="password" bind:value={password} required minlength="6" placeholder="••••••••" />
					</label>

					<button type="submit" class="btn btn-secondary full-width" disabled={loading}>
						{loading ? 'Loading...' : passwordMode === 'signin' ? 'Sign In' : 'Create Account'}
					</button>
				</form>

				<p class="toggle-mode">
					{#if passwordMode === 'signin'}
						Don't have an account? <button class="link-btn" onclick={() => passwordMode = 'signup'}>Sign up</button>
					{:else}
						Already have an account? <button class="link-btn" onclick={() => passwordMode = 'signin'}>Sign in</button>
					{/if}
				</p>
			{/if}
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

	.method-hint {
		text-align: center;
		color: var(--text-dim);
		font-size: 0.8rem;
		margin-top: 0.75rem;
	}

	.password-toggle {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.85rem;
		margin-top: 1.25rem;
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

	.name-status {
		font-size: 0.8rem;
		font-weight: 600;
		margin-top: -0.5rem;
		margin-bottom: 0.5rem;
	}

	.name-status.checking {
		color: var(--text-dim);
	}

	.name-status.available {
		color: var(--success, #4ade80);
	}

	.name-status.taken {
		color: var(--error, #f87171);
	}
</style>
