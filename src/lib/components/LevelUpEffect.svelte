<script lang="ts">
	import { onMount } from 'svelte';

	let { label }: { label: string } = $props();

	let canvas: HTMLCanvasElement;

	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		color: string;
		alpha: number;
		decay: number;
	}

	const COLORS = ['#fbbf24', '#22d3ee', '#ffffff', '#a78bfa', '#f472b6'];
	const PARTICLE_COUNT = 80;
	const GRAVITY = 50;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const rect = canvas.parentElement!.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;

		const cx = canvas.width / 2;
		const cy = canvas.height / 2;

		const particles: Particle[] = [];
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 80 + Math.random() * 280;
			particles.push({
				x: cx,
				y: cy,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				radius: 2 + Math.random() * 3,
				color: COLORS[Math.floor(Math.random() * COLORS.length)],
				alpha: 1,
				decay: 0.3 + Math.random() * 0.4
			});
		}

		let raf: number;
		let prev: number | null = null;

		function frame(ts: number) {
			if (!prev) prev = ts;
			const dt = Math.min((ts - prev) / 1000, 0.05);
			prev = ts;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			let alive = false;
			for (const p of particles) {
				p.x += p.vx * dt;
				p.y += p.vy * dt;
				p.vy += GRAVITY * dt;
				p.alpha -= p.decay * dt;
				if (p.alpha <= 0) continue;
				alive = true;

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fillStyle = p.color;
				ctx.globalAlpha = Math.max(0, p.alpha);
				ctx.fill();
			}
			ctx.globalAlpha = 1;

			if (alive) raf = requestAnimationFrame(frame);
		}

		raf = requestAnimationFrame(frame);

		return () => cancelAnimationFrame(raf);
	});
</script>

<div class="overlay">
	<div class="backdrop"></div>
	<canvas bind:this={canvas} class="particle-canvas"></canvas>
	<div class="content">
		<div class="congrats">CONGRATULATIONS!</div>
		<div class="unlock-label">
			<span class="unlock-level">{label}</span>
			<span class="unlock-text">Puzzles Unlocked!</span>
		</div>
		<div class="hint">Press Enter to continue</div>
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
		border-radius: inherit;
		overflow: hidden;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(10, 14, 23, 0.92);
		animation: fade-in 0.4s ease-out forwards;
	}

	.particle-canvas {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
	}

	.content {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		pointer-events: none;
	}

	.congrats {
		font-family: var(--font-mono);
		font-size: 2.4rem;
		font-weight: 900;
		letter-spacing: 0.06em;
		color: #fbbf24;
		text-shadow:
			0 0 30px rgba(251, 191, 36, 0.9),
			0 0 60px rgba(251, 191, 36, 0.5),
			0 0 100px rgba(251, 191, 36, 0.3);
		animation: slam-in 0.7s cubic-bezier(0.16, 1.6, 0.3, 1) forwards;
		opacity: 0;
	}

	.unlock-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		opacity: 0;
		animation: pop-up 0.6s cubic-bezier(0.16, 1.4, 0.3, 1) 0.35s forwards;
	}

	.unlock-level {
		font-family: var(--font-mono);
		font-size: 3.2rem;
		font-weight: 900;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #fff;
		text-shadow:
			0 0 30px rgba(34, 211, 238, 0.9),
			0 0 80px rgba(34, 211, 238, 0.6),
			0 0 120px rgba(34, 211, 238, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.unlock-text {
		font-family: var(--font-mono);
		font-size: 1.3rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent-dim, #22d3ee);
		text-shadow:
			0 0 20px rgba(34, 211, 238, 0.6),
			0 0 40px rgba(34, 211, 238, 0.3);
	}

	.hint {
		opacity: 0;
		animation: fade-in 0.5s ease-out 1s forwards;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-top: 0.8rem;
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

	@keyframes pop-up {
		0% {
			opacity: 0;
			transform: scale(0.3) translateY(20px);
			filter: blur(6px);
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

	@keyframes fade-in {
		0% { opacity: 0; }
		100% { opacity: 1; }
	}
</style>
