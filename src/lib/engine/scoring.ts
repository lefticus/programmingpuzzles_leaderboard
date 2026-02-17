export function calculateScore(
	difficulty: number,
	timeRemaining: number,
	timerDuration: number
): number {
	if (timeRemaining <= 0) return 0;
	const timeBonus = 0.5 + 0.5 * (timeRemaining / timerDuration);
	return Math.floor(Math.pow(difficulty, 1.5) * 10 * timeBonus);
}
