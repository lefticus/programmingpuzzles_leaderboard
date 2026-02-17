<script lang="ts">
	import type { ScoreBreakdown } from '$lib/engine/types';

	let { breakdown }: { breakdown: ScoreBreakdown } = $props();

	const timeSeconds = $derived(Math.round(breakdown.timeRemaining * 10) / 10);

	interface AnimLine {
		text: string;
		sub: string;
		cls: string;
		delay: number;
	}

	const lines: AnimLine[] = $derived.by(() => {
		const result: AnimLine[] = [];
		let d = 100;

		if (breakdown.correct) {
			result.push({
				text: `+${breakdown.basePoints}`,
				sub: `${breakdown.difficultyLabel}`,
				cls: 'line-base',
				delay: d
			});
			d += 250;

			if (breakdown.timeBonus > 0) {
				result.push({
					text: `+${breakdown.timeBonus}`,
					sub: `${timeSeconds}s remaining`,
					cls: 'line-time',
					delay: d
				});
				d += 250;
			}

			if (breakdown.multiplier > 1) {
				result.push({
					text: `\u00d72`,
					sub: 'NO REFERENCE',
					cls: 'line-mult',
					delay: d
				});
				d += 300;
			}

			result.push({
				text: `${breakdown.total}`,
				sub: '',
				cls: 'line-total',
				delay: d
			});
		} else {
			if (breakdown.total < 0) {
				result.push({
					text: `${breakdown.total}`,
					sub: 'PENALTY',
					cls: 'line-penalty',
					delay: 0
				});
			} else {
				result.push({
					text: `MISS`,
					sub: '',
					cls: 'line-miss',
					delay: 0
				});
			}
		}

		return result;
	});
</script>

<div class="overlay" class:correct={breakdown.correct} class:wrong={!breakdown.correct}>
	<div class="backdrop"></div>
	<div class="anim-stack">
		{#each lines as line, i (i)}
			<div class="anim-line {line.cls}" style="animation-delay: {line.delay}ms">
				<span class="line-text">{line.text}</span>
				{#if line.sub}
					<span class="line-sub">&nbsp;{line.sub}</span>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.overlay {
		position: absolute;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		border-radius: inherit;
		overflow: hidden;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		opacity: 0;
	}

	.correct .backdrop,
	.wrong .backdrop {
		background: rgba(10, 14, 23, 0.88);
		animation: fade-backdrop 0.3s ease-out forwards;
	}

	@keyframes fade-backdrop {
		0% { opacity: 0; }
		15% { opacity: 1; }
		100% { opacity: 1; }
	}

	.anim-stack {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}

	.anim-line {
		display: flex;
		align-items: baseline;
		opacity: 0;
		animation: pop-in 0.55s cubic-bezier(0.16, 1.4, 0.3, 1) forwards;
	}

	.line-text {
		font-family: var(--font-mono);
		font-weight: 900;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.line-sub {
		font-family: var(--font-mono);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* --- Correct lines --- */
	.line-base .line-text {
		font-size: 2.2rem;
		color: var(--accent);
		text-shadow:
			0 0 20px rgba(34, 211, 238, 0.8),
			0 0 50px rgba(34, 211, 238, 0.4);
	}
	.line-base .line-sub {
		font-size: 1rem;
		color: var(--accent-dim);
	}

	.line-time .line-text {
		font-size: 2.2rem;
		color: var(--success);
		text-shadow:
			0 0 20px rgba(52, 211, 153, 0.8),
			0 0 50px rgba(52, 211, 153, 0.4);
	}
	.line-time .line-sub {
		font-size: 1rem;
		color: rgba(52, 211, 153, 0.7);
	}

	.line-mult {
		animation-name: pop-in-pulse !important;
	}
	.line-mult .line-text {
		font-size: 2.6rem;
		color: var(--warning);
		text-shadow:
			0 0 30px rgba(251, 191, 36, 0.9),
			0 0 60px rgba(251, 191, 36, 0.5),
			0 0 100px rgba(251, 191, 36, 0.3);
	}
	.line-mult .line-sub {
		font-size: 1rem;
		color: rgba(251, 191, 36, 0.7);
		letter-spacing: 0.15em;
	}

	.line-total .line-text {
		font-size: 4rem;
		color: #fff;
		text-shadow:
			0 0 30px rgba(34, 211, 238, 0.9),
			0 0 80px rgba(34, 211, 238, 0.6),
			0 0 120px rgba(34, 211, 238, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.8);
	}
	.line-total {
		margin-top: 0.3rem;
		animation-name: slam-in !important;
		animation-duration: 0.7s !important;
		animation-timing-function: cubic-bezier(0.16, 1.6, 0.3, 1) !important;
	}

	/* --- Wrong lines --- */
	.line-penalty .line-text,
	.line-miss .line-text {
		font-size: 3.5rem;
		color: var(--error);
		text-shadow:
			0 0 30px rgba(248, 113, 113, 0.9),
			0 0 70px rgba(248, 113, 113, 0.5),
			0 0 120px rgba(248, 113, 113, 0.3);
	}
	.line-penalty .line-sub {
		font-size: 1rem;
		color: rgba(248, 113, 113, 0.7);
		letter-spacing: 0.15em;
	}
	.line-penalty,
	.line-miss {
		animation-name: shake-in !important;
		animation-duration: 0.65s !important;
		animation-timing-function: ease-out !important;
	}

	/* --- Keyframes --- */
	@keyframes pop-in {
		0% {
			opacity: 0;
			transform: scale(0.2) translateY(30px);
			filter: blur(8px);
		}
		60% {
			opacity: 1;
			filter: blur(0);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
			filter: blur(0);
		}
	}

	@keyframes pop-in-pulse {
		0% {
			opacity: 0;
			transform: scale(0.2) translateY(30px);
			filter: blur(8px);
		}
		50% {
			opacity: 1;
			transform: scale(1.25) translateY(0);
			filter: blur(0);
		}
		70% {
			transform: scale(0.95) translateY(0);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
			filter: blur(0);
		}
	}

	@keyframes slam-in {
		0% {
			opacity: 0;
			transform: scale(3.5);
			filter: blur(12px);
		}
		35% {
			opacity: 1;
			transform: scale(0.85);
			filter: blur(0);
		}
		55% {
			transform: scale(1.12);
		}
		75% {
			transform: scale(0.97);
		}
		100% {
			opacity: 1;
			transform: scale(1);
			filter: blur(0);
		}
	}

	@keyframes shake-in {
		0% {
			opacity: 0;
			transform: scale(2.5);
			filter: blur(10px);
		}
		20% {
			opacity: 1;
			transform: scale(1) translateX(-18px);
			filter: blur(0);
		}
		40% {
			transform: scale(1) translateX(14px);
		}
		55% {
			transform: scale(1) translateX(-8px);
		}
		70% {
			transform: scale(1) translateX(5px);
		}
		85% {
			transform: scale(1) translateX(-2px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateX(0);
			filter: blur(0);
		}
	}
</style>
