<script lang="ts">
	import type { CountdownTimer } from '$lib/engine/timer.svelte';

	let { timer }: { timer: CountdownTimer } = $props();

	const barColor = $derived(
		timer.fraction > 0.5 ? 'var(--accent)' :
		timer.fraction > 0.25 ? 'var(--warning)' :
		'var(--error)'
	);
</script>

<div class="timer">
	<div class="timer-bar">
		<div
			class="timer-fill"
			style="width: {timer.fraction * 100}%; background: {barColor};"
		></div>
	</div>
	<div class="timer-text mono">
		{timer.remaining.toFixed(1)}s
	</div>
</div>

<style>
	.timer {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
	}

	.timer-bar {
		flex: 1;
		height: 8px;
		background: var(--bg);
		border-radius: 4px;
		overflow: hidden;
	}

	.timer-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.1s linear;
	}

	.timer-text {
		font-size: 0.9rem;
		font-weight: 600;
		min-width: 4rem;
		text-align: right;
		color: var(--text-muted);
	}
</style>
