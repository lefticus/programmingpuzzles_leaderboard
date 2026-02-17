import type { PuzzleRound } from '$lib/engine/types';

function randomBigIntInRange(min: bigint, max: bigint): bigint {
	const range = max - min + 1n;
	const bits = range.toString(2).length;
	const bytes = Math.ceil(bits / 8);
	let result: bigint;

	do {
		const arr = new Uint8Array(bytes);
		crypto.getRandomValues(arr);
		result = 0n;
		for (const byte of arr) {
			result = (result << 8n) | BigInt(byte);
		}
		result = result % range;
	} while (result < 0n);

	return min + result;
}

export function formatBinary(n: bigint, bits: number): string {
	const raw = n.toString(2).padStart(bits, '0');
	const nibbles: string[] = [];
	for (let i = raw.length; i > 0; i -= 4) {
		nibbles.unshift(raw.slice(Math.max(0, i - 4), i));
	}
	return nibbles.join(' ');
}

/**
 * Pick a value from [min, max] that isn't in `seen`.
 * For small ranges (<=1024 values), build the available pool and pick from it.
 * For large ranges, random pick (collision is astronomically unlikely).
 * If the entire pool is exhausted, clears `seen` and picks fresh.
 */
function pickUnseenValue(min: bigint, max: bigint, seen: Set<string>): bigint {
	const rangeSize = max - min + 1n;

	if (rangeSize <= 1024n) {
		// Small range: enumerate available values
		const available: bigint[] = [];
		for (let v = min; v <= max; v++) {
			if (!seen.has(v.toString())) {
				available.push(v);
			}
		}
		if (available.length === 0) {
			// All values exhausted at this difficulty — clear seen and re-enumerate
			for (let v = min; v <= max; v++) {
				seen.delete(v.toString());
			}
			for (let v = min; v <= max; v++) {
				available.push(v);
			}
		}
		const idx = Math.floor(Math.random() * available.length);
		return available[idx];
	}

	// Large range: random pick, retry on (extremely unlikely) collision
	let value: bigint;
	do {
		value = randomBigIntInRange(min, max);
	} while (seen.has(value.toString()));
	return value;
}

export function generateBinaryDecimalRound(bits: number, seen: Set<string>): PuzzleRound {
	const min = bits === 1 ? 0n : 1n << BigInt(bits - 1);
	const max = (1n << BigInt(bits)) - 1n;
	const value = pickUnseenValue(min, max, seen);

	seen.add(value.toString());

	const mode = Math.random() < 0.5 ? 'bin2dec' : 'dec2bin';

	if (mode === 'bin2dec') {
		return {
			prompt: `Convert to decimal: ${formatBinary(value, bits)}`,
			answer: value.toString(10),
			displayPrompt: formatBinary(value, bits)
		};
	} else {
		return {
			prompt: `Convert to binary (${bits}-bit): ${value.toString(10)}`,
			answer: value.toString(2).padStart(bits, '0'),
			displayPrompt: value.toString(10)
		};
	}
}
