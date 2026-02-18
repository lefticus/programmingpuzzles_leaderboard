import type { NumberBase } from '$lib/engine/types';

/**
 * Generate explanation lines showing how to convert between bases.
 * Returns 1-2 short lines shown after wrong answers.
 */
export function explainConversion(
	fromBase: NumberBase,
	toBase: NumberBase,
	answer: string,
	displayPrompt: string,
	difficulty: number
): string[] {
	const key = `${fromBase}->${toBase}`;

	switch (key) {
		case 'binary->decimal':
			return explainBinaryToDecimal(displayPrompt, difficulty);
		case 'decimal->binary':
			return explainDecimalToBinary(answer, difficulty);
		case 'binary->hex':
			return explainBinaryToHex(displayPrompt);
		case 'hex->binary':
			return explainHexToBinary(displayPrompt);
		case 'binary->octal':
			return explainBinaryToOctal(displayPrompt);
		case 'octal->binary':
			return explainOctalToBinary(displayPrompt);
		case 'decimal->hex':
			return explainDecimalToHex(displayPrompt, answer, difficulty);
		case 'hex->decimal':
			return explainHexToDecimal(displayPrompt, difficulty);
		case 'decimal->octal':
			return explainDecimalToOctal(displayPrompt, answer, difficulty);
		case 'octal->decimal':
			return explainOctalToDecimal(displayPrompt, difficulty);
		case 'octal->hex':
			return explainOctalToHex(displayPrompt);
		case 'hex->octal':
			return explainHexToOctal(displayPrompt);
		case 'ascii->binary':
		case 'ascii->hex':
		case 'ascii->octal':
		case 'ascii->decimal':
			return explainAsciiToNumeric(displayPrompt, toBase);
		case 'binary->ascii':
		case 'hex->ascii':
		case 'octal->ascii':
		case 'decimal->ascii':
			return explainNumericToAscii(displayPrompt, fromBase);
		default:
			return [];
	}
}

function parseBinaryDigits(display: string): string {
	return display.replace(/^0b\s*/, '').replace(/\s+/g, '');
}

function parseValue(display: string, base: NumberBase): bigint {
	const cleaned = display.trim();
	switch (base) {
		case 'binary':
			return BigInt('0b' + parseBinaryDigits(cleaned));
		case 'hex':
			return BigInt('0x' + cleaned.replace(/^0x/i, ''));
		case 'octal':
			return BigInt('0o' + cleaned.replace(/^0o/i, ''));
		case 'decimal':
			return BigInt(cleaned);
		default:
			return 0n;
	}
}

// --- Binary <-> Decimal ---

function bitValueLine(bits: string): string {
	return bits
		.split('')
		.map((b, i) => `${b}\u00b7${(1n << BigInt(bits.length - 1 - i)).toString()}`)
		.join('  ');
}

function explainBinaryToDecimal(display: string, difficulty: number): string[] {
	const bits = parseBinaryDigits(display);
	const value = BigInt('0b' + bits);
	const terms: string[] = [];

	for (let i = 0; i < bits.length; i++) {
		if (bits[i] === '1') {
			const power = bits.length - 1 - i;
			terms.push((1n << BigInt(power)).toString());
		}
	}

	if (terms.length === 0) return ['0 = 0'];

	const lines: string[] = [];

	if (bits.length <= 8) {
		lines.push(bitValueLine(bits));
	}

	if (difficulty > 16 && terms.length > 4) {
		lines.push(`${terms[0]}+\u2026+${terms[terms.length - 1]} = ${value}`);
	} else {
		lines.push(`${terms.join(' + ')} = ${value}`);
	}

	return lines;
}

function explainDecimalToBinary(answer: string, difficulty: number): string[] {
	const bits = answer;
	const value = BigInt('0b' + bits);
	const terms: string[] = [];

	for (let i = 0; i < bits.length; i++) {
		if (bits[i] === '1') {
			const power = bits.length - 1 - i;
			terms.push((1n << BigInt(power)).toString());
		}
	}

	if (terms.length === 0) return ['0 = 0'];

	const binaryGrouped = groupBits(bits, 4);

	if (bits.length <= 8) {
		const sumLine = `${value} = ${terms.join('+')}`;
		const mappingLine = `${bitValueLine(bits)} \u2192 ${binaryGrouped}`;
		return [sumLine, mappingLine];
	}

	if (difficulty > 16 && terms.length > 4) {
		return [`${value} = ${terms[0]}+\u2026+${terms[terms.length - 1]} \u2192 ${binaryGrouped}`];
	}

	return [`${value} = ${terms.join('+')} \u2192 ${binaryGrouped}`];
}

// --- Binary <-> Hex ---

function explainBinaryToHex(display: string): string[] {
	const bits = parseBinaryDigits(display);
	const padded = bits.padStart(Math.ceil(bits.length / 4) * 4, '0');
	const parts: string[] = [];

	for (let i = 0; i < padded.length; i += 4) {
		const nibble = padded.slice(i, i + 4);
		const hexDigit = parseInt(nibble, 2).toString(16).toUpperCase();
		parts.push(`${nibble}=${hexDigit}`);
	}

	return [parts.join('  ')];
}

function explainHexToBinary(display: string): string[] {
	const hex = display.replace(/^0x/i, '').trim();
	const parts: string[] = [];

	for (const ch of hex) {
		const nibble = parseInt(ch, 16).toString(2).padStart(4, '0');
		parts.push(`${ch}=${nibble}`);
	}

	return [parts.join('  ')];
}

// --- Binary <-> Octal ---

function explainBinaryToOctal(display: string): string[] {
	const bits = parseBinaryDigits(display);
	const padded = bits.padStart(Math.ceil(bits.length / 3) * 3, '0');
	const parts: string[] = [];

	for (let i = 0; i < padded.length; i += 3) {
		const triplet = padded.slice(i, i + 3);
		const octalDigit = parseInt(triplet, 2).toString(8);
		parts.push(`${triplet}=${octalDigit}`);
	}

	return [parts.join('  ')];
}

function explainOctalToBinary(display: string): string[] {
	const octal = display.replace(/^0o/i, '').trim();
	const parts: string[] = [];

	for (const ch of octal) {
		const triplet = parseInt(ch, 8).toString(2).padStart(3, '0');
		parts.push(`${ch}=${triplet}`);
	}

	return [parts.join('  ')];
}

// --- Decimal <-> Hex ---

function explainDecimalToHex(display: string, answer: string, difficulty: number): string[] {
	const value = BigInt(display.trim());
	const hex = answer.toUpperCase();

	if (difficulty > 16) return [];

	const parts: string[] = [];
	let remaining = value;
	for (let i = 0; i < hex.length; i++) {
		const placeValue = 16n ** BigInt(hex.length - 1 - i);
		const digit = remaining / placeValue;
		remaining = remaining % placeValue;
		parts.push(`${digitToHexChar(digit)}\u00d716${superscript(hex.length - 1 - i)}`);
	}

	// Simpler format for short hex
	if (hex.length <= 2) {
		const digits = hex.split('');
		const expanded = digits.map((d, i) => {
			const placeVal = 16 ** (digits.length - 1 - i);
			return `${d}\u00d7${placeVal}`;
		});
		const values = digits.map((d, i) => {
			const placeVal = 16 ** (digits.length - 1 - i);
			return parseInt(d, 16) * placeVal;
		});
		return [`${value} = ${expanded.join(' + ')} \u2192 ${digits.join(' ')}`];
	}

	return [`${value} = ${hex.split('').join(' ')}`];
}

function explainHexToDecimal(display: string, difficulty: number): string[] {
	const hex = display.replace(/^0x/i, '').trim().toUpperCase();
	const value = BigInt('0x' + hex);

	if (difficulty > 16) return [];

	if (hex.length <= 2) {
		const digits = hex.split('');
		const expanded = digits.map((d, i) => {
			const placeVal = 16 ** (digits.length - 1 - i);
			return `${d}\u00d7${placeVal}`;
		});
		const values = digits.map((d, i) => {
			const placeVal = 16 ** (digits.length - 1 - i);
			return parseInt(d, 16) * placeVal;
		});
		return [`${expanded.join(' + ')} = ${values.join(' + ')} = ${value}`];
	}

	// Longer hex: just show positional
	const digits = hex.split('');
	const expanded = digits.map((d, i) => {
		const placeVal = 16 ** (digits.length - 1 - i);
		return `${d}\u00d7${placeVal}`;
	});
	return [`${expanded.join(' + ')} = ${value}`];
}

// --- Decimal <-> Octal ---

function explainDecimalToOctal(display: string, answer: string, difficulty: number): string[] {
	const value = BigInt(display.trim());

	if (difficulty > 16) return [];

	const digits = answer.split('');
	if (digits.length <= 3) {
		const expanded = digits.map((d, i) => {
			const placeVal = 8 ** (digits.length - 1 - i);
			return `${d}\u00d7${placeVal}`;
		});
		return [`${value} = ${expanded.join(' + ')} \u2192 ${digits.join(' ')}`];
	}

	return [`${value} = ${digits.join(' ')}`];
}

function explainOctalToDecimal(display: string, difficulty: number): string[] {
	const octal = display.replace(/^0o/i, '').trim();
	const value = BigInt('0o' + octal);

	if (difficulty > 16) return [];

	const digits = octal.split('');
	if (digits.length <= 3) {
		const expanded = digits.map((d, i) => {
			const placeVal = 8 ** (digits.length - 1 - i);
			return `${d}\u00d7${placeVal}`;
		});
		const values = digits.map((d, i) => {
			const placeVal = 8 ** (digits.length - 1 - i);
			return parseInt(d, 8) * placeVal;
		});
		return [`${expanded.join(' + ')} = ${values.join(' + ')} = ${value}`];
	}

	const expanded = digits.map((d, i) => {
		const placeVal = 8 ** (digits.length - 1 - i);
		return `${d}\u00d7${placeVal}`;
	});
	return [`${expanded.join(' + ')} = ${value}`];
}

// --- Octal <-> Hex (via binary intermediate) ---

function explainOctalToHex(display: string): string[] {
	const octal = display.replace(/^0o/i, '').trim();
	// Step 1: octal -> binary
	const binaryParts: string[] = [];
	for (const ch of octal) {
		binaryParts.push(parseInt(ch, 8).toString(2).padStart(3, '0'));
	}
	const binary = binaryParts.join('');

	// Step 2: binary -> hex
	const padded = binary.padStart(Math.ceil(binary.length / 4) * 4, '0');
	const hexParts: string[] = [];
	for (let i = 0; i < padded.length; i += 4) {
		const nibble = padded.slice(i, i + 4);
		hexParts.push(parseInt(nibble, 2).toString(16).toUpperCase());
	}

	const octalExp = octal.split('').map((ch) => `${ch}=${parseInt(ch, 8).toString(2).padStart(3, '0')}`).join('  ');
	const hexExp = (() => {
		const parts: string[] = [];
		for (let i = 0; i < padded.length; i += 4) {
			const nibble = padded.slice(i, i + 4);
			parts.push(`${nibble}=${parseInt(nibble, 2).toString(16).toUpperCase()}`);
		}
		return parts.join('  ');
	})();

	return [octalExp, hexExp];
}

function explainHexToOctal(display: string): string[] {
	const hex = display.replace(/^0x/i, '').trim().toUpperCase();
	// Step 1: hex -> binary
	const binaryParts: string[] = [];
	for (const ch of hex) {
		binaryParts.push(parseInt(ch, 16).toString(2).padStart(4, '0'));
	}
	const binary = binaryParts.join('');

	// Step 2: binary -> octal
	const padded = binary.padStart(Math.ceil(binary.length / 3) * 3, '0');
	const octalParts: string[] = [];
	for (let i = 0; i < padded.length; i += 3) {
		const triplet = padded.slice(i, i + 3);
		octalParts.push(parseInt(triplet, 2).toString(8));
	}

	const hexExp = hex.split('').map((ch) => `${ch}=${parseInt(ch, 16).toString(2).padStart(4, '0')}`).join('  ');
	const octalExp = (() => {
		const parts: string[] = [];
		for (let i = 0; i < padded.length; i += 3) {
			const triplet = padded.slice(i, i + 3);
			parts.push(`${triplet}=${parseInt(triplet, 2).toString(8)}`);
		}
		return parts.join('  ');
	})();

	return [hexExp, octalExp];
}

// --- ASCII conversions ---

function explainAsciiToNumeric(display: string, toBase: NumberBase): string[] {
	const chars = display.split('');
	const parts = chars.map((ch) => {
		const code = ch.charCodeAt(0);
		const formatted = formatCodeForBase(code, toBase);
		return `${ch}=${code}=${formatted}`;
	});
	return [parts.join('  ')];
}

function explainNumericToAscii(display: string, fromBase: NumberBase): string[] {
	const chunks = parseNumericChunks(display, fromBase);
	const parts = chunks.map(({ raw, code }) => {
		const ch = String.fromCharCode(code);
		return `${raw}=${code}=${ch}`;
	});
	return [parts.join('  ')];
}

// --- Helpers ---

function groupBits(bits: string, groupSize: number): string {
	const groups: string[] = [];
	for (let i = bits.length; i > 0; i -= groupSize) {
		groups.unshift(bits.slice(Math.max(0, i - groupSize), i));
	}
	return groups.join(' ');
}

function digitToHexChar(n: bigint): string {
	return n.toString(16).toUpperCase();
}

function superscript(n: number): string {
	const map: Record<string, string> = {
		'0': '\u2070',
		'1': '\u00b9',
		'2': '\u00b2',
		'3': '\u00b3',
		'4': '\u2074',
		'5': '\u2075',
		'6': '\u2076',
		'7': '\u2077',
		'8': '\u2078',
		'9': '\u2079'
	};
	return String(n)
		.split('')
		.map((ch) => map[ch] ?? ch)
		.join('');
}

function formatCodeForBase(code: number, base: NumberBase): string {
	switch (base) {
		case 'binary':
			return code.toString(2).padStart(8, '0');
		case 'hex':
			return code.toString(16).toUpperCase().padStart(2, '0');
		case 'octal':
			return code.toString(8).padStart(3, '0');
		case 'decimal':
			return code.toString(10);
		default:
			return code.toString();
	}
}

function parseNumericChunks(
	display: string,
	base: NumberBase
): { raw: string; code: number }[] {
	// Display is space-separated formatted values like "0b 0100 0011  0b 0101 0000"
	// or "0x43  0x50" etc.
	const trimmed = display.trim();

	if (base === 'binary') {
		// Split on double-space (separator between values)
		const parts = trimmed.split(/\s{2,}/);
		return parts.map((part) => {
			const bits = part.replace(/^0b\s*/, '').replace(/\s+/g, '');
			const code = parseInt(bits, 2);
			return { raw: bits, code };
		});
	}

	if (base === 'hex') {
		const parts = trimmed.split(/\s{2,}/);
		return parts.map((part) => {
			const hex = part.replace(/^0x/i, '').trim();
			const code = parseInt(hex, 16);
			return { raw: hex, code };
		});
	}

	if (base === 'octal') {
		const parts = trimmed.split(/\s{2,}/);
		return parts.map((part) => {
			const oct = part.replace(/^0o/i, '').trim();
			const code = parseInt(oct, 8);
			return { raw: oct, code };
		});
	}

	if (base === 'decimal') {
		const parts = trimmed.split(/\s{2,}/);
		return parts.map((part) => {
			const dec = part.trim();
			const code = parseInt(dec, 10);
			return { raw: dec, code };
		});
	}

	return [];
}
