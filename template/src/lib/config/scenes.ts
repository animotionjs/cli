import { createSequence } from '@animotion/core';
import './configure';

export const sequence = createSequence(
	import.meta.glob(['../../scenes/*.svelte', '../../scenes/*/scene.svelte'])
);
