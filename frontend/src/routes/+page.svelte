<script lang="ts">
	import PresetForm from '$lib/PresetForm.svelte';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data } from '../store';

	let selected_preset: Preset | null = null;
</script>

<div class="container h-full mx-auto items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">Create a card</h2>
		{#if $data.presets.length}
			<RadioGroup>
				{#each $data.presets as preset}
					<RadioItem bind:group={selected_preset} name="type" value={preset}
						>{preset.name}</RadioItem
					>
				{/each}
			</RadioGroup>
		{/if}
		<h2 class="h2">Create a card preset</h2>
		<PresetForm />
	</div>
</div>

<style lang="postcss">
</style>
