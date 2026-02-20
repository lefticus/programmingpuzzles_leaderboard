<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';

	let name = $state(auth.profileDisplayName);
	let status = $state<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
	let submitting = $state(false);
	let submitError = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	function validate(value: string): boolean {
		return value.length >= 2 && value.length <= 20;
	}

	function handleInput() {
		clearTimeout(debounceTimer);
		submitError = '';

		if (!validate(name)) {
			status = name.length > 0 ? 'invalid' : 'idle';
			return;
		}

		// If name matches current profile name (auto-assigned), still check
		status = 'checking';
		debounceTimer = setTimeout(async () => {
			const available = await auth.checkDisplayName(name);
			status = available ? 'available' : 'taken';
		}, 300);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validate(name) || status !== 'available') return;

		submitting = true;
		submitError = '';
		const { error } = await auth.updateDisplayName(name);
		submitting = false;

		if (error) {
			submitError = error;
		}
	}
</script>

<div class="name-prompt-overlay">
	<div class="name-prompt card">
		<h2>Choose Your Display Name</h2>
		<p class="subtitle">This is how you'll appear on leaderboards.</p>

		<form onsubmit={handleSubmit}>
			<label class="field">
				<span>Display Name</span>
				<input
					type="text"
					bind:value={name}
					oninput={handleInput}
					minlength="2"
					maxlength="20"
					required
					placeholder="PlayerOne"
					autofocus
				/>
			</label>

			{#if status === 'checking'}
				<p class="status-msg checking">Checking...</p>
			{:else if status === 'available'}
				<p class="status-msg available">Available</p>
			{:else if status === 'taken'}
				<p class="status-msg taken">Taken</p>
			{:else if status === 'invalid'}
				<p class="status-msg taken">Must be 2-20 characters</p>
			{/if}

			{#if submitError}
				<div class="error-msg">{submitError}</div>
			{/if}

			<button
				type="submit"
				class="btn btn-primary full-width"
				disabled={submitting || status !== 'available'}
			>
				{submitting ? 'Saving...' : 'Confirm Name'}
			</button>
		</form>
	</div>
</div>

<style>
	.name-prompt-overlay {
		display: flex;
		justify-content: center;
		padding-top: 3rem;
	}

	.name-prompt {
		width: 100%;
		max-width: 420px;
	}

	.name-prompt h2 {
		text-align: center;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		text-align: center;
		color: var(--text-dim);
		font-size: 0.85rem;
		margin-bottom: 1.5rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 0.5rem;
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

	.status-msg {
		font-size: 0.8rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.checking {
		color: var(--text-dim);
	}

	.available {
		color: var(--success, #4ade80);
	}

	.taken {
		color: var(--error, #f87171);
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
</style>
