import type { PuzzleRound, NumberBase } from '$lib/engine/types';

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

export function pickUnseenValue(min: bigint, max: bigint, seen: Set<string>): bigint {
	const rangeSize = max - min + 1n;

	if (rangeSize <= 1024n) {
		const available: bigint[] = [];
		for (let v = min; v <= max; v++) {
			if (!seen.has(v.toString())) {
				available.push(v);
			}
		}
		if (available.length === 0) {
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

	let value: bigint;
	do {
		value = randomBigIntInRange(min, max);
	} while (seen.has(value.toString()));
	return value;
}

export function formatBinary(n: bigint, bits: number): string {
	const raw = n.toString(2).padStart(bits, '0');
	const nibbles: string[] = [];
	for (let i = raw.length; i > 0; i -= 4) {
		nibbles.unshift(raw.slice(Math.max(0, i - 4), i));
	}
	return nibbles.join(' ');
}

export function formatOctal(n: bigint): string {
	return '0o' + n.toString(8);
}

export function formatHex(n: bigint, bits: number): string {
	const hexDigits = Math.ceil(bits / 4);
	return '0x' + n.toString(16).toUpperCase().padStart(hexDigits, '0');
}

export function formatDecimal(n: bigint): string {
	return n.toString(10);
}

export function formatForBase(n: bigint, base: NumberBase, bits: number): string {
	switch (base) {
		case 'binary': return formatBinary(n, bits);
		case 'octal': return formatOctal(n);
		case 'hex': return formatHex(n, bits);
		case 'decimal': return formatDecimal(n);
	}
}

export function answerForBase(n: bigint, base: NumberBase, bits: number): string {
	switch (base) {
		case 'binary': return n.toString(2).padStart(bits, '0');
		case 'octal': return n.toString(8);
		case 'hex': return n.toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0');
		case 'decimal': return n.toString(10);
	}
}

const baseLabels: Record<NumberBase, string> = {
	binary: 'binary',
	octal: 'octal',
	decimal: 'decimal',
	hex: 'hexadecimal'
};

export function generateConversionRound(
	bits: number,
	seen: Set<string>,
	baseA: NumberBase,
	baseB: NumberBase
): PuzzleRound {
	const min = bits <= 1 ? 0n : 1n << BigInt(bits - 1);
	const max = (1n << BigInt(bits)) - 1n;
	const value = pickUnseenValue(min, max, seen);
	seen.add(value.toString());

	const forward = Math.random() < 0.5;
	const fromBase = forward ? baseA : baseB;
	const toBase = forward ? baseB : baseA;

	return {
		prompt: `Convert to ${baseLabels[toBase]}`,
		answer: answerForBase(value, toBase, bits),
		displayPrompt: formatForBase(value, fromBase, bits),
		answerType: toBase,
		promptLabel: `Convert to ${baseLabels[toBase]}`
	};
}
