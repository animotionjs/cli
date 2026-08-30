<script lang="ts">
	import { page } from '$app/state';
	import { TimelineView } from '@animotion/core';
	import { sequence } from '#lib/config/scenes';

	const sceneId = $derived(page.params.scene ?? sequence[0]?.id);
</script>

{#if sceneId}
	<TimelineView {sequence} {sceneId} />
{/if}
