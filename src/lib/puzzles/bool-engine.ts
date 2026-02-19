import type { PuzzleRound } from '$lib/engine/types';

// --- Boolean tree types ---

export interface BoolVarNode {
	type: 'var';
	name: string;
}

export interface BoolNotNode {
	type: 'not';
	child: BoolNode;
}

export interface BoolOpNode {
	type: 'binop';
	op: 'AND' | 'OR' | 'XOR';
	left: BoolNode;
	right: BoolNode;
}

export type BoolNode = BoolVarNode | BoolNotNode | BoolOpNode;

// --- Helpers ---

function randomInt(min: number, max: number): number {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

// --- Operator precedence (higher = binds tighter) ---
// NOT > AND > XOR > OR

const precedence: Record<string, number> = {
	OR: 1,
	XOR: 2,
	AND: 3,
	NOT: 4
};

// --- Available ops by difficulty ---

type BoolBinOp = 'AND' | 'OR' | 'XOR';

function availableOps(difficulty: number): { binOps: BoolBinOp[]; allowNot: boolean } {
	if (difficulty <= 2) return { binOps: ['AND', 'OR'], allowNot: false };
	if (difficulty <= 4) return { binOps: ['AND', 'OR'], allowNot: true };
	return { binOps: ['AND', 'OR', 'XOR'], allowNot: true };
}

function numVarsForDifficulty(difficulty: number): number {
	if (difficulty <= 2) return 2;
	if (difficulty <= 4) return randomInt(2, 3);
	return randomInt(3, 4);
}

// --- Tree construction ---

const varNames = ['A', 'B', 'C', 'D'];

export function buildBoolTree(
	numOps: number,
	binOps: BoolBinOp[],
	allowNot: boolean,
	vars: string[]
): BoolNode {
	if (numOps === 0) {
		return { type: 'var', name: pick(vars) };
	}

	// Maybe use NOT (counts as 1 op, has 1 child)
	if (allowNot && numOps >= 1 && Math.random() < 0.25) {
		return {
			type: 'not',
			child: buildBoolTree(numOps - 1, binOps, allowNot, vars)
		};
	}

	// Binary op
	const op = pick(binOps);
	const leftOps = randomInt(0, numOps - 1);
	const rightOps = numOps - 1 - leftOps;

	return {
		type: 'binop',
		op,
		left: buildBoolTree(leftOps, binOps, allowNot, vars),
		right: buildBoolTree(rightOps, binOps, allowNot, vars)
	};
}

// --- Evaluation ---

export function evaluateBool(node: BoolNode, vars: Record<string, boolean>): boolean {
	switch (node.type) {
		case 'var':
			return vars[node.name];
		case 'not':
			return !evaluateBool(node.child, vars);
		case 'binop': {
			const left = evaluateBool(node.left, vars);
			const right = evaluateBool(node.right, vars);
			switch (node.op) {
				case 'AND': return left && right;
				case 'OR': return left || right;
				case 'XOR': return left !== right;
			}
		}
	}
}

// --- Serialization with minimal parens ---

function opPrecedence(node: BoolNode): number {
	if (node.type === 'not') return precedence.NOT;
	if (node.type === 'binop') return precedence[node.op];
	return 999; // var: never needs parens
}

export function serializeBool(node: BoolNode): string {
	if (node.type === 'var') return node.name;

	if (node.type === 'not') {
		const child = node.child;
		// Parenthesize binary ops under NOT
		if (child.type === 'binop') {
			return `NOT (${serializeBool(child)})`;
		}
		return `NOT ${serializeBool(child)}`;
	}

	// Binary op
	const parentPrec = precedence[node.op];

	function serializeChild(child: BoolNode): string {
		const childPrec = opPrecedence(child);
		const s = serializeBool(child);
		// Parenthesize if child has strictly lower precedence
		if (child.type === 'binop' && childPrec < parentPrec) {
			return `(${s})`;
		}
		return s;
	}

	return `${serializeChild(node.left)} ${node.op} ${serializeChild(node.right)}`;
}

// --- Validation: no degenerate expressions ---

function collectVars(node: BoolNode): Set<string> {
	const vars = new Set<string>();
	function walk(n: BoolNode) {
		if (n.type === 'var') vars.add(n.name);
		else if (n.type === 'not') walk(n.child);
		else { walk(n.left); walk(n.right); }
	}
	walk(node);
	return vars;
}

function isDegenerate(node: BoolNode): boolean {
	// Check if a binary op has identical serialized children (e.g., A AND A)
	if (node.type === 'binop') {
		const left = serializeBool(node.left);
		const right = serializeBool(node.right);
		if (left === right) return true;
		if (isDegenerate(node.left) || isDegenerate(node.right)) return true;
	}
	if (node.type === 'not') return isDegenerate(node.child);
	return false;
}

// --- Round generation ---

export function generateBoolRound(numOps: number, seen: Set<string>): PuzzleRound {
	const { binOps, allowNot } = availableOps(numOps);
	const numVars = numVarsForDifficulty(numOps);
	const vars = varNames.slice(0, numVars);
	const maxRetries = 100;

	for (let i = 0; i < maxRetries; i++) {
		const tree = buildBoolTree(numOps, binOps, allowNot, vars);

		// Ensure all vars are used
		const usedVars = collectVars(tree);
		if (usedVars.size < numVars) continue;

		// No degenerate expressions
		if (isDegenerate(tree)) continue;

		const expr = serializeBool(tree);

		// Build variable assignments
		const assignments: Record<string, boolean> = {};
		for (const v of vars) {
			assignments[v] = Math.random() < 0.5;
		}

		const varLine = vars.map((v) => `${v} = ${assignments[v] ? '1' : '0'}`).join(', ');
		const key = `${varLine}|${expr}`;
		if (seen.has(key)) continue;
		seen.add(key);

		const result = evaluateBool(tree, assignments);

		return {
			prompt: varLine,
			answer: result ? '1' : '0',
			displayPrompt: expr,
			promptLabel: varLine
		};
	}

	// Fallback: generate without seen check
	let tree: BoolNode;
	let usedVars: Set<string>;
	do {
		tree = buildBoolTree(numOps, binOps, allowNot, vars);
		usedVars = collectVars(tree);
	} while (usedVars.size < numVars || isDegenerate(tree));

	const expr = serializeBool(tree);
	const assignments: Record<string, boolean> = {};
	for (const v of vars) {
		assignments[v] = Math.random() < 0.5;
	}
	const varLine = vars.map((v) => `${v} = ${assignments[v] ? '1' : '0'}`).join(', ');
	const result = evaluateBool(tree, assignments);

	return {
		prompt: varLine,
		answer: result ? '1' : '0',
		displayPrompt: expr,
		promptLabel: varLine
	};
}

// --- Explanation generation ---

export function explainBool(displayPrompt: string, varLine: string): string[] {
	const steps: string[] = [];

	// Parse variable assignments from varLine
	const assignments: Record<string, boolean> = {};
	for (const part of varLine.split(',')) {
		const [name, val] = part.trim().split(/\s*=\s*/);
		assignments[name] = val === '1';
	}

	// Show substitution
	let substituted = displayPrompt;
	for (const [name, val] of Object.entries(assignments)) {
		substituted = substituted.replace(new RegExp(`\\b${name}\\b`, 'g'), val ? '1' : '0');
	}
	steps.push(substituted);

	// Parse and evaluate to show intermediate steps
	const tree = parseBoolExpr(displayPrompt);
	if (tree) {
		collectBoolSteps(tree, assignments, steps);
	}

	return steps;
}

// --- Simple bool expression parser (for explanations) ---

function parseBoolExpr(expr: string): BoolNode | null {
	const tokens = tokenize(expr);
	let pos = 0;

	function peek(): string | undefined {
		return tokens[pos];
	}

	function consume(): string {
		return tokens[pos++];
	}

	function parseOr(): BoolNode {
		let left = parseXor();
		while (peek() === 'OR') {
			consume();
			const right = parseXor();
			left = { type: 'binop', op: 'OR', left, right };
		}
		return left;
	}

	function parseXor(): BoolNode {
		let left = parseAnd();
		while (peek() === 'XOR') {
			consume();
			const right = parseAnd();
			left = { type: 'binop', op: 'XOR', left, right };
		}
		return left;
	}

	function parseAnd(): BoolNode {
		let left = parseNot();
		while (peek() === 'AND') {
			consume();
			const right = parseNot();
			left = { type: 'binop', op: 'AND', left, right };
		}
		return left;
	}

	function parseNot(): BoolNode {
		if (peek() === 'NOT') {
			consume();
			return { type: 'not', child: parseNot() };
		}
		return parseAtom();
	}

	function parseAtom(): BoolNode {
		if (peek() === '(') {
			consume(); // skip '('
			const node = parseOr();
			consume(); // skip ')'
			return node;
		}
		const name = consume();
		return { type: 'var', name };
	}

	try {
		return parseOr();
	} catch {
		return null;
	}
}

function tokenize(expr: string): string[] {
	const tokens: string[] = [];
	let i = 0;
	while (i < expr.length) {
		if (expr[i] === ' ') { i++; continue; }
		if (expr[i] === '(' || expr[i] === ')') {
			tokens.push(expr[i]);
			i++;
			continue;
		}
		// Read a word
		let word = '';
		while (i < expr.length && expr[i] !== ' ' && expr[i] !== '(' && expr[i] !== ')') {
			word += expr[i];
			i++;
		}
		tokens.push(word);
	}
	return tokens;
}

function collectBoolSteps(
	node: BoolNode,
	vars: Record<string, boolean>,
	steps: string[]
): void {
	if (node.type === 'var') return;

	if (node.type === 'not') {
		collectBoolSteps(node.child, vars, steps);
		const childVal = evaluateBool(node.child, vars);
		const result = !childVal;
		steps.push(`NOT ${childVal ? '1' : '0'} = ${result ? '1' : '0'}`);
		return;
	}

	collectBoolSteps(node.left, vars, steps);
	collectBoolSteps(node.right, vars, steps);
	const left = evaluateBool(node.left, vars);
	const right = evaluateBool(node.right, vars);
	const result = evaluateBool(node, vars);
	steps.push(`${left ? '1' : '0'} ${node.op} ${right ? '1' : '0'} = ${result ? '1' : '0'}`);
}

// --- Timer config ---

export const timerBool: [number, number][] = [
	[1, 10], [2, 15], [3, 20], [4, 30], [5, 45], [6, 60]
];

export function timerForBool(numOps: number): number {
	for (const [ops, secs] of timerBool) {
		if (numOps <= ops) return secs;
	}
	return 60;
}

// --- Difficulty label ---

export function boolOpsLabel(level: number): string {
	return level === 1 ? '1 op' : `${level} ops`;
}
