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
	return '0b ' + nibbles.join(' ');
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

export function formatAscii(n: bigint): string {
	return String.fromCharCode(Number(n));
}

export function formatForBase(n: bigint, base: NumberBase, bits: number): string {
	switch (base) {
		case 'binary': return formatBinary(n, bits);
		case 'octal': return formatOctal(n);
		case 'hex': return formatHex(n, bits);
		case 'decimal': return formatDecimal(n);
		case 'ascii': return formatAscii(n);
	}
}

export function answerForBase(n: bigint, base: NumberBase, bits: number): string {
	switch (base) {
		case 'binary': return n.toString(2).padStart(bits, '0');
		case 'octal': return n.toString(8);
		case 'hex': return n.toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0');
		case 'decimal': return n.toString(10);
		case 'ascii': return String.fromCharCode(Number(n));
	}
}

const baseLabels: Record<NumberBase, string> = {
	binary: 'binary',
	octal: 'octal',
	decimal: 'decimal',
	hex: 'hexadecimal',
	ascii: 'ASCII'
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

const asciiWidths: Record<string, number> = {
	binary: 8,
	hex: 2,
	octal: 3,
	decimal: 2
};

function formatAsciiNumeric(charCode: bigint, base: NumberBase): string {
	const width = asciiWidths[base] ?? 0;
	switch (base) {
		case 'binary': return charCode.toString(2).padStart(width, '0');
		case 'hex': return charCode.toString(16).toUpperCase().padStart(width, '0');
		case 'octal': return charCode.toString(8).padStart(width, '0');
		case 'decimal': return charCode.toString(10).padStart(width, '0');
		default: return '';
	}
}

// Tech-related words grouped by length for multi-char ASCII puzzles
const asciiWords: Record<number, string[]> = {
	3: [
		'CPU', 'GPU', 'RAM', 'ROM', 'BIT', 'BUS', 'GIT', 'SSH', 'TCP', 'UDP',
		'API', 'CLI', 'GUI', 'DNS', 'URL', 'USB', 'SSD', 'HDD', 'LAN', 'WAN',
		'MAC', 'NIC', 'SQL', 'CSS', 'DOM', 'XML', 'PNG', 'SVG', 'ZIP', 'TAR',
		'LOG', 'KEY', 'HEX', 'BUG', 'FIX', 'DEV', 'OPS', 'VPN', 'IOT', 'APK',
		'IDE', 'SDK', 'JIT', 'AOT', 'ORM', 'MVC', 'TLS', 'GPG', 'PGP', 'RSA',
	],
	4: [
		'BYTE', 'CODE', 'DATA', 'DISK', 'FILE', 'HASH', 'HEAP', 'HOST', 'HTTP',
		'JAVA', 'KERN', 'LINK', 'LOAD', 'LOCK', 'LOOP', 'MEMO', 'MODE', 'NODE',
		'NULL', 'PAGE', 'PATH', 'PING', 'PIPE', 'PORT', 'PUSH', 'PULL', 'READ',
		'ROOT', 'RUST', 'SCAN', 'SEED', 'SORT', 'SYNC', 'TASK', 'TREE', 'TYPE',
		'UNIX', 'USER', 'VOID', 'WASM', 'WIFI', 'WIRE', 'YARN', 'ZERO', 'BLOB',
		'CHAR', 'CHIP', 'CRON', 'CURL', 'ENUM', 'EXEC', 'FLAG', 'FORK', 'FUNC',
	],
	5: [
		'ARRAY', 'ASYNC', 'AWAIT', 'CACHE', 'CLASS', 'CLONE', 'CLOUD', 'CONST',
		'DEBUG', 'FETCH', 'FLOAT', 'FLUSH', 'FRAME', 'INDEX', 'INPUT', 'LINUX',
		'MERGE', 'MOUSE', 'MUTEX', 'PATCH', 'PIXEL', 'PRINT', 'PROXY', 'QUERY',
		'QUEUE', 'REACT', 'ROUTE', 'SCOPE', 'SHELL', 'STACK', 'STATE', 'STORE',
		'SUPER', 'TABLE', 'TOKEN', 'TUPLE', 'WHILE', 'WRITE', 'YIELD', 'BLOCK',
		'TRUNK', 'FIBER', 'STDIN', 'REGEX', 'PARSE', 'GRAPH', 'EPOCH', 'SHARD',
	],
	6: [
		'BINARY', 'BRANCH', 'BUFFER', 'CIPHER', 'CLIENT', 'CONFIG', 'CURSOR',
		'DAEMON', 'DECODE', 'DELETE', 'DEPLOY', 'DOCKER', 'DOMAIN', 'DRIVER',
		'ENCODE', 'ENGINE', 'EXPORT', 'FILTER', 'GITHUB', 'GLOBAL', 'IMPORT',
		'INSERT', 'KERNEL', 'LAMBDA', 'LINKED', 'MALLOC', 'MASTER', 'METHOD',
		'MODULE', 'OBJECT', 'OFFSET', 'OUTPUT', 'PYTHON', 'REBASE', 'RECORD',
		'REDUCE', 'RETURN', 'ROUTER', 'SCHEMA', 'SCRIPT', 'SEARCH', 'SELECT',
		'SERVER', 'SIGNAL', 'SOCKET', 'SOURCE', 'STATIC', 'STREAM', 'STRING',
		'STRUCT', 'SWITCH', 'SYNTAX', 'SYSTEM', 'TENSOR', 'THREAD', 'UPDATE',
	],
	7: [
		'BOOLEAN', 'COMPILE', 'CONSOLE', 'DEVTOOL', 'DISPLAY', 'ELEMENT',
		'ENCRYPT', 'GATEWAY', 'INTEGER', 'KEYWORD', 'LIBRARY', 'NETWORK',
		'PACKAGE', 'PAYLOAD', 'POINTER', 'PRIVATE', 'PROCESS', 'PROGRAM',
		'PROJECT', 'PROMISE', 'RUNTIME', 'SESSION', 'SERVLET', 'STORAGE',
		'TESTING', 'TOOLBAR', 'UNICODE', 'VIRTUAL', 'WEBHOOK', 'WEBSITE',
	],
	8: [
		'ABSTRACT', 'ASSEMBLY', 'CALLBACK', 'COMPRESS', 'CONSUMER', 'DATABASE',
		'DEBUGGER', 'DOWNLOAD', 'ENDPOINT', 'ETHERNET', 'FIRMWARE', 'FUNCTION',
		'HARDWARE', 'HASHCODE', 'HOSTNAME', 'INSTANCE', 'ITERATOR', 'KEYBOARD',
		'METADATA', 'OVERFLOW', 'PLATFORM', 'PROTOCOL', 'PROVIDER', 'REGISTER',
		'RESPONSE', 'SCHEDULE', 'SECURITY', 'SNAPSHOT', 'SOFTWARE', 'TEMPLATE',
		'TERMINAL', 'TRACKING', 'TRANSMIT', 'VARIABLE', 'WORKFLOW',
	]
};

function pickAsciiWord(numChars: number, seen: Set<string>): string {
	const words = asciiWords[numChars];
	if (!words) {
		// Fallback: shouldn't happen since difficulty is 1-8
		return 'A'.repeat(numChars);
	}
	const available = words.filter((w) => !seen.has(w));
	if (available.length === 0) {
		// All used — clear seen for this length and pick from full list
		for (const w of words) seen.delete(w);
		return words[Math.floor(Math.random() * words.length)];
	}
	return available[Math.floor(Math.random() * available.length)];
}

export function generateAsciiConversionRound(
	numChars: number,
	seen: Set<string>,
	otherBase: NumberBase
): PuzzleRound {
	let letterStr: string;

	if (numChars <= 2) {
		// 1-2 chars: random uppercase letters
		const chars: number[] = [];
		for (let i = 0; i < numChars; i++) {
			chars.push(65 + Math.floor(Math.random() * 26));
		}
		letterStr = chars.map((c) => String.fromCharCode(c)).join('');
		if (seen.has(letterStr)) {
			return generateAsciiConversionRound(numChars, seen, otherBase);
		}
	} else {
		// 3+ chars: pick from curated word list
		letterStr = pickAsciiWord(numChars, seen);
	}

	seen.add(letterStr);

	const charCodes = Array.from(letterStr, (ch) => ch.charCodeAt(0));
	const forward = Math.random() < 0.5; // true = ASCII→number, false = number→ASCII

	if (forward) {
		// Display letters, answer is concatenated numeric
		const answer = charCodes.map((c) => formatAsciiNumeric(BigInt(c), otherBase)).join('');
		return {
			prompt: `Convert to ${baseLabels[otherBase]}`,
			answer,
			displayPrompt: letterStr,
			answerType: otherBase,
			promptLabel: `Convert to ${baseLabels[otherBase]}`
		};
	} else {
		// Display formatted numbers (space-separated), answer is letters
		const display = charCodes.map((c) => formatForBase(BigInt(c), otherBase, 8)).join('  ');
		return {
			prompt: `Convert to ${baseLabels.ascii}`,
			answer: letterStr,
			displayPrompt: display,
			answerType: 'ascii',
			promptLabel: `Convert to ${baseLabels.ascii}`
		};
	}
}
