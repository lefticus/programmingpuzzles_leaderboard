<script lang="ts">
	import type { GameState } from '$lib/engine/game-state.svelte';
	let { gameState }: { gameState: GameState } = $props();
	let userAnswer = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	const round = $derived(gameState.currentRound);
	const lines = $derived((round?.displayPrompt ?? '').split('\n'));
	const operandA = $derived(lines[0] ?? '');
	const operandB = $derived(lines[1] ?? '');

	$effect(() => {
		if (gameState.phase === 'playing') {
			userAnswer = '';
			inputEl?.focus();
		}
	});

	function handleInput() {
		// Binary only: 0 and 1
		userAnswer = userAnswer.replace(/[^01]/g, '');
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (gameState.phase !== 'playing' || !userAnswer.trim()) return;
		// Strip leading zeros
		const normalized = userAnswer.trim().replace(/^0+(?=\d)/, '') || '0';
		gameState.submitAnswer(normalized);
	}
</script>

<div class="conversion-puzzle">
	<div class="difficulty-badge">
		{gameState.plugin.difficultyLabel(gameState.difficulty)}
	</div>

	<div class="prompt-area">
		<div class="label">Add</div>
		<div class="binary-stack mono">
			<div class="operand">{operandA}</div>
			<div class="operand plus">+ {operandB}</div>
			<div class="separator"></div>
		</div>
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
					placeholder="binary answer"
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

	.binary-stack {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: 0.15em;
		line-height: 1.4;
	}

	.operand {
		white-space: nowrap;
	}

	.separator {
		width: 100%;
		height: 2px;
		background: var(--accent);
		margin-top: 0.15rem;
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
		letter-spacing: 0.15em;
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
