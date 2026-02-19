import type { PuzzleRound } from '$lib/engine/types';
import { bitLabel } from './shared';

// --- Difficulty → bits mapping ---

const levelToBits: number[] = [2, 3, 4, 5, 6, 8];

export function bitsForLevel(level: number): number {
	return levelToBits[Math.min(level, levelToBits.length) - 1];
}

// --- Round generation ---

export function generateBinaryAddRound(bits: number, seen: Set<string>): PuzzleRound {
	const max = (1 << bits) - 1;
	const maxRetries = 100;

	for (let i = 0; i < maxRetries; i++) {
		let a = 1 + Math.floor(Math.random() * (max - 1));
		let b = 1 + Math.floor(Math.random() * (max - 1));

		// Ensure at least one has the high bit set (actually N-bit)
		if (a < (1 << (bits - 1)) && b < (1 << (bits - 1))) {
			if (Math.random() < 0.5) {
				a = (1 << (bits - 1)) + Math.floor(Math.random() * (1 << (bits - 1)));
			} else {
				b = (1 << (bits - 1)) + Math.floor(Math.random() * (1 << (bits - 1)));
			}
			// Clamp to max
			a = Math.min(a, max);
			b = Math.min(b, max);
		}

		const key = `${a}+${b}`;
		if (seen.has(key)) continue;
		seen.add(key);

		const sum = a + b;
		const aBin = a.toString(2).padStart(bits, '0');
		const bBin = b.toString(2).padStart(bits, '0');
		const answer = sum.toString(2);

		return {
			prompt: `${aBin}\n${bBin}`,
			answer,
			displayPrompt: `${aBin}\n${bBin}`,
			promptLabel: 'Add'
		};
	}

	// Fallback
	const a = (1 << (bits - 1)) + Math.floor(Math.random() * (1 << (bits - 1)));
	const b = 1 + Math.floor(Math.random() * (max - 1));
	const sum = a + b;
	const aBin = a.toString(2).padStart(bits, '0');
	const bBin = b.toString(2).padStart(bits, '0');

	return {
		prompt: `${aBin}\n${bBin}`,
		answer: sum.toString(2),
		displayPrompt: `${aBin}\n${bBin}`,
		promptLabel: 'Add'
	};
}

// --- Explanation generation ---

export function explainBinaryAdd(displayPrompt: string): string[] {
	const [aBin, bBin] = displayPrompt.split('\n');
	const bits = aBin.length;
	const steps: string[] = [];
	let carry = 0;

	for (let i = bits - 1; i >= 0; i--) {
		const aBit = parseInt(aBin[i]);
		const bBit = parseInt(bBin[i]);
		const sum = aBit + bBit + carry;
		const resultBit = sum % 2;
		const newCarry = Math.floor(sum / 2);

		const col = bits - i;
		if (carry > 0) {
			steps.push(`Col ${col}: ${aBit} + ${bBit} + ${carry} = ${sum}${newCarry ? ` (write ${resultBit}, carry 1)` : ` → ${resultBit}`}`);
		} else {
			steps.push(`Col ${col}: ${aBit} + ${bBit} = ${sum}${newCarry ? ` (write ${resultBit}, carry 1)` : ` → ${resultBit}`}`);
		}
		carry = newCarry;
	}

	if (carry) {
		steps.push(`Carry out: 1`);
	}

	const a = parseInt(aBin, 2);
	const b = parseInt(bBin, 2);
	const sum = a + b;
	steps.push(`Result: ${sum.toString(2)}`);

	return steps;
}

// --- Timer config ---

export const timerBinaryAdd: [number, number][] = [
	[2, 10], [3, 15], [4, 20], [5, 30], [6, 40], [8, 60]
];

export function timerForBinaryAdd(bits: number): number {
	for (const [b, secs] of timerBinaryAdd) {
		if (bits <= b) return secs;
	}
	return 60;
}

// --- Difficulty label ---

export function binaryAddLabel(level: number): string {
	return bitLabel(bitsForLevel(level));
}
