import type { PuzzleRound } from '$lib/engine/types';

// --- Expression tree types ---

export interface LeafNode {
	type: 'leaf';
	value: number;
}

export interface OpNode {
	type: 'op';
	op: '+' | '-' | '*';
	left: ExprNode;
	right: ExprNode;
}

export type ExprNode = LeafNode | OpNode;

// --- Tree construction ---

const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];

function randomInt(min: number, max: number): number {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function randomOp(): '+' | '-' | '*' {
	return ops[Math.floor(Math.random() * ops.length)];
}

export function buildTree(numOps: number): ExprNode {
	if (numOps === 0) {
		return { type: 'leaf', value: randomInt(1, 9) };
	}

	const op = randomOp();
	// Distribute remaining ops between left and right subtrees
	const leftOps = randomInt(0, numOps - 1);
	const rightOps = numOps - 1 - leftOps;

	return {
		type: 'op',
		op,
		left: buildTree(leftOps),
		right: buildTree(rightOps)
	};
}

// --- Evaluation ---

export function evaluate(node: ExprNode): number {
	if (node.type === 'leaf') return node.value;

	const left = evaluate(node.left);
	const right = evaluate(node.right);

	switch (node.op) {
		case '+': return left + right;
		case '-': return left - right;
		case '*': return left * right;
	}
}

// --- Constraint validation ---

export function validateConstraints(node: ExprNode): boolean {
	if (node.type === 'leaf') return true;

	if (!validateConstraints(node.left) || !validateConstraints(node.right)) return false;

	if (node.op === '*') {
		const leftVal = Math.abs(evaluate(node.left));
		const rightVal = Math.abs(evaluate(node.right));
		// One operand must be ≤ 9 and the other ≤ 99
		const ok =
			(leftVal <= 9 && rightVal <= 99) ||
			(rightVal <= 9 && leftVal <= 99);
		if (!ok) return false;
	}

	// Final result cap: keep answers to at most 2 digits
	if (Math.abs(evaluate(node)) > 99) return false;

	return true;
}

// --- Serialization ---

export function toRPN(node: ExprNode): string {
	if (node.type === 'leaf') return String(node.value);
	return `${toRPN(node.left)} ${toRPN(node.right)} ${node.op}`;
}

export function toSExpr(node: ExprNode): string {
	if (node.type === 'leaf') return String(node.value);
	return `(${node.op} ${toSExpr(node.left)} ${toSExpr(node.right)})`;
}

// --- Round generation ---

export function generateExpressionRound(
	numOps: number,
	seen: Set<string>,
	format: 'rpn' | 'sexpr'
): PuzzleRound {
	const maxRetries = 100;

	for (let i = 0; i < maxRetries; i++) {
		const tree = buildTree(numOps);

		if (!validateConstraints(tree)) continue;

		const serialized = format === 'rpn' ? toRPN(tree) : toSExpr(tree);
		if (seen.has(serialized)) continue;

		seen.add(serialized);
		const result = evaluate(tree);

		return {
			prompt: 'Evaluate',
			answer: String(result),
			displayPrompt: serialized,
			promptLabel: 'Evaluate'
		};
	}

	// Fallback: generate without seen check
	let tree: ExprNode;
	do {
		tree = buildTree(numOps);
	} while (!validateConstraints(tree));

	const serialized = format === 'rpn' ? toRPN(tree) : toSExpr(tree);
	seen.add(serialized);

	return {
		prompt: 'Evaluate',
		answer: String(evaluate(tree)),
		displayPrompt: serialized,
		promptLabel: 'Evaluate'
	};
}

// --- Timer config: [numOps, seconds] ---

export const timerExpression: [number, number][] = [
	[1, 10],
	[2, 15],
	[3, 20],
	[4, 30],
	[5, 45],
	[6, 60]
];

export function timerForOps(numOps: number): number {
	for (const [ops, secs] of timerExpression) {
		if (numOps <= ops) return secs;
	}
	return 60;
}

// --- Difficulty label ---

export function opsLabel(level: number): string {
	return level === 1 ? '1 op' : `${level} ops`;
}

// --- Parsing (for explanation generation) ---

const opSymbols = new Set(['+', '-', '*']);

export function parseRPN(expr: string): ExprNode {
	const tokens = expr.trim().split(/\s+/);
	const stack: ExprNode[] = [];

	for (const token of tokens) {
		if (opSymbols.has(token)) {
			const right = stack.pop()!;
			const left = stack.pop()!;
			stack.push({ type: 'op', op: token as '+' | '-' | '*', left, right });
		} else {
			stack.push({ type: 'leaf', value: Number(token) });
		}
	}

	return stack[0];
}

export function parseSExpr(expr: string): ExprNode {
	let pos = 0;
	const s = expr.trim();

	function parse(): ExprNode {
		skipWhitespace();
		if (s[pos] === '(') {
			pos++; // skip '('
			skipWhitespace();
			const op = s[pos] as '+' | '-' | '*';
			pos++; // skip op
			skipWhitespace();
			const left = parse();
			skipWhitespace();
			const right = parse();
			skipWhitespace();
			pos++; // skip ')'
			return { type: 'op', op, left, right };
		} else {
			let num = '';
			while (pos < s.length && /[0-9]/.test(s[pos])) {
				num += s[pos];
				pos++;
			}
			return { type: 'leaf', value: Number(num) };
		}
	}

	function skipWhitespace() {
		while (pos < s.length && s[pos] === ' ') pos++;
	}

	return parse();
}

// --- Explanation generation ---

const opDisplay: Record<string, string> = { '+': '+', '-': '\u2212', '*': '\u00d7' };

/**
 * Generate step-by-step explanation lines for an expression tree.
 * Shows each operation in evaluation order (bottom-up, left-to-right).
 */
export function explainExpression(displayPrompt: string, format: 'rpn' | 'sexpr'): string[] {
	const tree = format === 'rpn' ? parseRPN(displayPrompt) : parseSExpr(displayPrompt);
	const steps: string[] = [];
	collectSteps(tree, steps);
	return steps;
}

function collectSteps(node: ExprNode, steps: string[]): void {
	if (node.type === 'leaf') return;

	collectSteps(node.left, steps);
	collectSteps(node.right, steps);

	const left = evaluate(node.left);
	const right = evaluate(node.right);
	const result = evaluate(node);
	steps.push(`${left} ${opDisplay[node.op]} ${right} = ${result}`);
}
