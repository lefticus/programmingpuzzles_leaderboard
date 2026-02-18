<script lang="ts">
	import type { ScoreBreakdown } from '$lib/engine/types';

	let { breakdown, explanation = [] }: { breakdown: ScoreBreakdown; explanation?: string[] } = $props();

	interface AnimLine {
		key: string;
		text: string;
		sub: string;
		cls: string;
		delay: number;
		countdown?: { from: number; to: number; subFrom: number; duration: number };
	}

	const lines: AnimLine[] = $derived.by(() => {
		const result: AnimLine[] = [];
		let d = 100;

		if (breakdown.correct) {
			result.push({
				key: 'base',
				text: `+${breakdown.basePoints}`,
				sub: `${breakdown.difficultyLabel}`,
				cls: 'line-base',
				delay: d
			});
			d = 300;

			if (breakdown.timeBonus > 0) {
				result.push({
					key: 'time',
					text: `+${breakdown.timeBonus}`,
					sub: `${Math.round(breakdown.timeRemaining * 10) / 10}s remaining`,
					cls: 'line-time',
					delay: d,
					countdown: {
						from: 0,
						to: breakdown.timeBonus,
						subFrom: Math.round(breakdown.timeRemaining * 10) / 10,
						duration: 300
					}
				});
				d = 550;
			}

			if (breakdown.streakBonus > 0) {
				result.push({
					key: 'streak',
					text: `+${breakdown.streakBonus}`,
					sub: `×${breakdown.streakCount} STREAK`,
					cls: 'line-streak',
					delay: d
				});
				d += 150;
			}

			if (breakdown.multiplier > 1) {
				result.push({
					key: 'mult',
					text: `\u00d72`,
					sub: 'NO REFERENCE',
					cls: 'line-mult',
					delay: d
				});
				d += 150;
			}

			result.push({
				key: 'total',
				text: `${breakdown.total}`,
				sub: '',
				cls: 'line-total',
				delay: d
			});
		} else {
			if (breakdown.total < 0) {
				result.push({
					key: 'penalty',
					text: `${breakdown.total}`,
					sub: 'PENALTY',
					cls: 'line-penalty',
					delay: 0
				});
			} else {
				result.push({
					key: 'miss',
					text: `MISS`,
					sub: '',
					cls: 'line-miss',
					delay: 0
				});
			}
		}

		return result;
	});

	// Countdown animation state for time bonus
	let countdownText = $state('');
	let countdownSub = $state('');
	let countdownActive = $state(false);

	$effect(() => {
		const timeLine = lines.find((l) => l.countdown);
		if (!timeLine?.countdown) {
			countdownActive = false;
			return;
		}

		const { from, to, subFrom, duration } = timeLine.countdown;
		const lineDelay = timeLine.delay;
		countdownActive = false;
		countdownText = `+${from}`;
		countdownSub = `${subFrom.toFixed(1)}s remaining`;

		let rafId: number;
		const timeoutId = setTimeout(() => {
			countdownActive = true;
			const startTime = performance.now();

			function tick(now: number) {
				const elapsed = now - startTime;
				const t = Math.min(elapsed / duration, 1);
				const currentPoints = Math.round(from + (to - from) * t);
				const currentSeconds = subFrom - subFrom * t;
				countdownText = `+${currentPoints}`;
				countdownSub = `${currentSeconds.toFixed(1)}s remaining`;

				if (t < 1) {
					rafId = requestAnimationFrame(tick);
				} else {
					countdownText = `+${to}`;
					countdownSub = `0.0s remaining`;
				}
			}

			rafId = requestAnimationFrame(tick);
		}, lineDelay);

		return () => {
			clearTimeout(timeoutId);
			cancelAnimationFrame(rafId);
		};
	});
</script>

<div class="overlay" class:correct={breakdown.correct} class:wrong={!breakdown.correct}>
	<div class="backdrop"></div>
	<div class="anim-stack">
		{#each lines as line (line.key)}
			<div class="anim-line {line.cls}" style="animation-delay: {line.delay}ms">
				{#if line.countdown}
					<span class="line-text">{countdownActive ? countdownText : line.text}</span>
					<span class="line-sub"
						>&nbsp;{countdownActive ? countdownSub : line.sub}</span
					>
				{:else}
					<span class="line-text">{line.text}</span>
					{#if line.sub}
						<span class="line-sub">&nbsp;{line.sub}</span>
					{/if}
				{/if}
			</div>
		{/each}
		{#if explanation.length > 0}
			<div class="explain-block" style="animation-delay: 400ms">
				{#each explanation as line}
					<div class="explain-line">{line}</div>
				{/each}
			</div>
		{/if}
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
		0% {
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		100% {
			opacity: 1;
		}
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

	.line-streak .line-text {
		font-size: 2.2rem;
		color: #fbbf24;
		text-shadow:
			0 0 20px rgba(251, 191, 36, 0.8),
			0 0 50px rgba(251, 191, 36, 0.4);
	}
	.line-streak .line-sub {
		font-size: 1rem;
		color: rgba(251, 191, 36, 0.7);
		letter-spacing: 0.12em;
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

	/* --- Explanation lines (wrong answers) --- */
	.explain-block {
		margin-top: 0.6rem;
		opacity: 0;
		animation: pop-in 0.5s ease-out forwards;
		text-align: center;
	}

	.explain-line {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.55);
		line-height: 1.5;
		letter-spacing: 0.03em;
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
