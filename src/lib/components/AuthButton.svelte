<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	async function handleSignOut() {
		await auth.signOut();
		goto(`${base}/`);
	}
</script>

<div class="auth-button">
	{#if auth.loading}
		<span class="loading">...</span>
	{:else if auth.user}
		<span class="user-name">{auth.profileDisplayName}</span>
		<button class="btn btn-secondary btn-sm" onclick={handleSignOut}>Sign Out</button>
	{:else}
		<a href="{base}/login/" class="btn btn-primary btn-sm">Sign In</a>
	{/if}
</div>

<style>
	.auth-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-left: auto;
	}

	.user-name {
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.loading {
		color: var(--text-dim);
		font-family: var(--font-mono);
	}

	.btn-sm {
		padding: 0.35rem 0.8rem;
		font-size: 0.8rem;
	}
</style>
