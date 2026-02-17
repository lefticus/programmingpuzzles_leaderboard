export class CountdownTimer {
	remaining = $state(0);
	duration = $state(0);
	running = $state(false);
	fraction = $derived(this.duration > 0 ? this.remaining / this.duration : 1);
	expired = $derived(this.running && this.remaining <= 0);

	private intervalId: ReturnType<typeof setInterval> | null = null;
	private onExpire: (() => void) | null = null;

	start(duration: number, onExpire?: () => void) {
		this.stop();
		this.duration = duration;
		this.remaining = duration;
		this.running = true;
		this.onExpire = onExpire ?? null;

		this.intervalId = setInterval(() => {
			this.remaining = Math.max(0, this.remaining - 0.1);
			if (this.remaining <= 0) {
				this.stop();
				this.onExpire?.();
			}
		}, 100);
	}

	stop() {
		this.running = false;
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	destroy() {
		this.stop();
	}
}
