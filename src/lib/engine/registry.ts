import type { PuzzlePlugin } from './types';

const plugins = new Map<string, PuzzlePlugin>();

export function registerPuzzle(plugin: PuzzlePlugin) {
	plugins.set(plugin.slug, plugin);
}

export function getPuzzle(slug: string): PuzzlePlugin | undefined {
	return plugins.get(slug);
}

export function getAllPuzzles(): PuzzlePlugin[] {
	return Array.from(plugins.values());
}
