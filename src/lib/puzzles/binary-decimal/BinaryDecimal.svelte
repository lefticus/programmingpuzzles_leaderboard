<script lang="ts">
	import type { GameState } from '$lib/engine/game-state.svelte';
	import { formatBinary } from './generator';

	let { gameState }: { gameState: GameState } = $props();
	let userAnswer = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	const round = $derived(gameState.currentRound);
	const isBinToDec = $derived(round?.prompt.startsWith('Convert to decimal'));
	const displayValue = $derived(round?.displayPrompt ?? '');

	$effect(() => {
		if (gameState.phase === 'playing') {
			userAnswer = '';
			inputEl?.focus();
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (gameState.phase !== 'playing' || !userAnswer.trim()) return;

		let normalizedAnswer = userAnswer.trim();
		if (!isBinToDec) {
			normalizedAnswer = normalizedAnswer.replace(/\s+/g, '');
			// Pad to expected length
			const expectedLen = round!.answer.length;
			normalizedAnswer = normalizedAnswer.padStart(expectedLen, '0');
		}

		gameState.submitAnswer(normalizedAnswer);
	}

	function formatExpectedDisplay(answer: string): string {
		if (isBinToDec) return answer;
		const bits = answer.length;
		return formatBinary(BigInt('0b' + answer), bits);
	}
</script>

<div class="binary-decimal">
	<div class="difficulty-badge">
		{gameState.plugin.difficultyLabel(gameState.difficulty)}
	</div>

	<div class="prompt-area">
		{#if isBinToDec}
			<div class="label">Convert to decimal</div>
			<div class="binary-display mono">{displayValue}</div>
		{:else}
			<div class="label">Convert to {round?.answer.length}-bit binary</div>
			<div class="decimal-display mono">{displayValue}</div>
		{/if}
	</div>

	{#if gameState.phase === 'playing'}
		<form class="answer-form" onsubmit={handleSubmit}>
			<input
				bind:this={inputEl}
				bind:value={userAnswer}
				class="answer-input mono"
				type="text"
				placeholder={isBinToDec ? 'Enter decimal...' : 'Enter binary...'}
				autocomplete="off"
				autofocus
			/>
			<button type="submit" class="btn btn-primary">Submit</button>
		</form>
	{/if}

	{#if gameState.phase === 'answered'}
		<div class="result" class:correct={gameState.lastAnswerCorrect} class:wrong={!gameState.lastAnswerCorrect}>
			{#if gameState.lastAnswerCorrect}
				<div class="result-label">Correct! +{gameState.lastScore}</div>
			{:else}
				<div class="result-label">
					{gameState.timer.remaining <= 0 ? 'Time\'s up!' : 'Wrong!'}
					{#if gameState.lastScore < 0}
						<span class="penalty">{gameState.lastScore}</span>
					{/if}
				</div>
				<div class="expected mono">
					Answer: {formatExpectedDisplay(round!.answer)}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.binary-decimal {
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

	.binary-display {
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: 0.15em;
		word-spacing: 0.3em;
	}

	.decimal-display {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--accent);
	}

	.answer-form {
		display: flex;
		gap: 0.75rem;
		width: 100%;
		max-width: 500px;
	}

	.answer-input {
		flex: 1;
		padding: 0.7rem 1rem;
		background: var(--bg);
		border: 2px solid var(--border);
		border-radius: var(--radius);
		font-size: 1.2rem;
		text-align: center;
		letter-spacing: 0.1em;
	}

	.answer-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.result {
		text-align: center;
		padding: 1rem 1.5rem;
		border-radius: var(--radius);
		min-width: 200px;
	}

	.result.correct {
		background: #065f4633;
		border: 1px solid var(--success);
	}

	.result.wrong {
		background: #991b1b33;
		border: 1px solid var(--error);
	}

	.result-label {
		font-weight: 700;
		font-size: 1.1rem;
	}

	.correct .result-label {
		color: var(--success);
	}

	.wrong .result-label {
		color: var(--error);
	}

	.expected {
		margin-top: 0.5rem;
		color: var(--text-muted);
		font-size: 0.95rem;
	}

	.penalty {
		font-size: 0.9rem;
		opacity: 0.8;
	}
</style>
