<script lang="ts">
	import type { GameState } from '$lib/engine/game-state.svelte';
	import type { NumberBase } from '$lib/engine/types';
	import { formatForBase } from '$lib/puzzles/shared';
	let { gameState }: { gameState: GameState } = $props();
	let userAnswer = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	const round = $derived(gameState.currentRound);
	const answerType = $derived<NumberBase>(round?.answerType ?? 'decimal');
	const displayValue = $derived(round?.displayPrompt ?? '');
	const promptLabel = $derived(round?.promptLabel ?? '');

	const inputFilter: Record<NumberBase, RegExp> = {
		binary: /[^01\s]/g,
		octal: /[^0-7]/g,
		decimal: /[^0-9]/g,
		hex: /[^0-9a-fA-F]/g,
		ascii: /[^A-Z]/g
	};

	const prefixes: Record<NumberBase, string> = {
		binary: '0b',
		octal: '0o',
		decimal: '',
		hex: '0x',
		ascii: ''
	};

	$effect(() => {
		if (gameState.phase === 'playing') {
			userAnswer = '';
			inputEl?.focus();
		}
	});

	function handleInput() {
		if (answerType === 'ascii') {
			userAnswer = userAnswer.toUpperCase();
		}
		userAnswer = userAnswer.replace(inputFilter[answerType], '');
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (gameState.phase !== 'playing' || !userAnswer.trim()) return;
		gameState.submitAnswer(userAnswer.trim().replace(/\s+/g, ''));
	}

	function formatExpectedDisplay(answer: string): string {
		if (answerType === 'ascii') return answer;
		const bits = answer.length;
		if (answerType === 'binary') {
			return formatForBase(BigInt('0b' + answer), 'binary', bits);
		}
		return formatForBase(BigInt(answerType === 'hex' ? '0x' + answer : answerType === 'octal' ? '0o' + answer : answer), answerType, bits);
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
				{#if prefixes[answerType]}
					<span class="input-prefix mono">{prefixes[answerType]}</span>
				{/if}
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
			Answer: {formatExpectedDisplay(round!.answer)}
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

	.input-prefix {
		padding-left: 1rem;
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--text-dim);
		user-select: none;
		flex-shrink: 0;
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

	@media (max-width: 600px) {
		.conversion-puzzle {
			gap: 0.75rem;
		}

		.display-value {
			font-size: 1.4rem;
		}

		.answer-form {
			flex-direction: column;
		}

		.answer-input {
			font-size: 1rem;
		}

		.input-prefix {
			font-size: 1rem;
		}

		.difficulty-badge {
			font-size: 0.7rem;
			padding: 0.2rem 0.6rem;
		}
	}

</style>
