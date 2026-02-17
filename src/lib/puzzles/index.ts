import { registerPuzzle } from '$lib/engine/registry';
import { binaryDecimalPlugin } from './binary-decimal/plugin';
import { hexBinaryPlugin } from './hex-binary/plugin';
import { hexDecimalPlugin } from './hex-decimal/plugin';
import { binaryOctalPlugin } from './binary-octal/plugin';
import { octalHexPlugin } from './octal-hex/plugin';
import { octalDecimalPlugin } from './octal-decimal/plugin';

registerPuzzle(binaryDecimalPlugin);
registerPuzzle(hexBinaryPlugin);
registerPuzzle(hexDecimalPlugin);
registerPuzzle(binaryOctalPlugin);
registerPuzzle(octalHexPlugin);
registerPuzzle(octalDecimalPlugin);
