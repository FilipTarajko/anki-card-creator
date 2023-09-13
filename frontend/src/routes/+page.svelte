<script lang="ts">
	import PresetForm from '$lib/PresetForm.svelte';
	import DownloadComponent from '$lib/DownloadComponent.svelte';
	import NoteComponent from '$lib/NoteComponent.svelte';
	import GuideComponent from '$lib/GuideComponent.svelte';
	import DevelopersPlayground from '$lib/DevelopersPlayground.svelte';

	import { data } from '../store';
</script>

<div class="container h-full mx-auto items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		{#if $data.current_page == '0'}
			<GuideComponent />
		{:else if $data.current_page == '1'}
			<PresetForm />
		{:else if $data.current_page == '2'}
			<NoteComponent />
		{:else if $data.current_page == '3'}
			<DownloadComponent />
		{:else if $data.current_page == '4'}
			<DevelopersPlayground />
		{/if}
	</div>
</div>
