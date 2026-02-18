<script lang="ts">
	import type { GameState } from '$lib/engine/game-state.svelte';
	let { gameState }: { gameState: GameState } = $props();
	let userAnswer = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	const round = $derived(gameState.currentRound);
	const displayValue = $derived(round?.displayPrompt ?? '');
	const promptLabel = $derived(round?.promptLabel ?? '');

	$effect(() => {
		if (gameState.phase === 'playing') {
			userAnswer = '';
			inputEl?.focus();
		}
	});

	function handleInput() {
		// Allow digits and minus sign (minus only at position 0)
		userAnswer = userAnswer.replace(/[^0-9-]/g, '');
		// Remove any minus that isn't at position 0
		if (userAnswer.length > 1) {
			userAnswer = userAnswer[0] + userAnswer.slice(1).replace(/-/g, '');
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (gameState.phase !== 'playing' || !userAnswer.trim()) return;
		// Normalize: strip leading zeros after optional minus
		const normalized = userAnswer.trim().replace(/^(-?)0+(?=\d)/, '$1');
		gameState.submitAnswer(normalized);
	}
</script>

<div class="conversion-puzzle">
	<div class="difficulty-badge">
		{gameState.plugin.difficultyLabel(gameState.difficulty)}
	</div>

	<div class="prompt-area">
		<div class="label">{promptLabel}</div>
		<div class="display-value mono">{displayValue}</div>
	</div>

	{#if gameState.phase === 'playing'}
		<form class="answer-form" onsubmit={handleSubmit}>
			<div class="input-wrapper">
				<input
					bind:this={inputEl}
					bind:value={userAnswer}
					oninput={handleInput}
					class="answer-input mono"
					type="text"
					autocomplete="off"
				/>
			</div>
			<button type="submit" class="btn btn-primary">Submit</button>
		</form>
	{/if}

	{#if gameState.phase === 'answered' && !gameState.lastAnswerCorrect}
		<div class="expected mono">
			Answer: {round!.answer}
		</div>
	{/if}
</div>

<style>
	.conversion-puzzle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.difficulty-badge {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		padding: 0.3rem 0.8rem;
		border-radius: 999px;
		font-size: 0.8rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.prompt-area {
		text-align: center;
	}

	.label {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin-bottom: 0.75rem;
		font-weight: 500;
	}

	.display-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: 0.1em;
		word-spacing: 0.3em;
	}

	.answer-form {
		display: flex;
		gap: 0.75rem;
		width: 100%;
		max-width: 500px;
	}

	.input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		background: var(--bg);
		border: 2px solid var(--border);
		border-radius: var(--radius);
		transition: border-color 0.15s;
	}

	.input-wrapper:focus-within {
		border-color: var(--accent);
	}

	.answer-input {
		flex: 1;
		padding: 0.7rem 1rem;
		font-size: 1.2rem;
		letter-spacing: 0.1em;
	}

	.answer-input:focus {
		outline: none;
	}

	.expected {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.95rem;
	}
</style>
