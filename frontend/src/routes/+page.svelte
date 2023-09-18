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
		<div
			class={`space-y-10 text-center flex flex-col items-center ${
				$data.current_page == '0' ? 'block' : 'hidden'
			}`}
		>
			<GuideComponent />
		</div>
		<div
			class={`space-y-10 text-center flex flex-col items-center ${
				$data.current_page == '1' ? 'block' : 'hidden'
			}`}
		>
			<PresetForm />
		</div>
		<div
			class={`space-y-10 text-center flex flex-col items-center ${
				$data.current_page == '2' ? 'block' : 'hidden'
			}`}
		>
			<NoteComponent />
		</div>
		<div
			class={`space-y-10 text-center flex flex-col items-center ${
				$data.current_page == '3' ? 'block' : 'hidden'
			}`}
		>
			<DownloadComponent />
		</div>
		<div
			class={`space-y-10 text-center flex flex-col items-center ${
				$data.current_page == '4' ? 'block' : 'hidden'
			}`}
		>
			<DevelopersPlayground />
		</div>
	</div>
</div>
