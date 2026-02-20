import '$lib/puzzles';
import { getAllPuzzles } from '$lib/engine/registry';

const modes = ['sprint', 'marathon', 'untimed'] as const;

export function entries() {
	const puzzles = getAllPuzzles();
	const entries: { slug: string; mode?: string }[] = [];
	for (const p of puzzles) {
		entries.push({ slug: p.slug });
		for (const m of modes) {
			entries.push({ slug: p.slug, mode: m });
		}
	}
	return entries;
}
