<script lang="ts">
	import PresetForm from '$lib/PresetForm.svelte';
	import DownloadComponent from '$lib/DownloadComponent.svelte';
	import NoteComponent from '$lib/NoteComponent.svelte';
	import GuideComponent from '$lib/GuideComponent.svelte';
	import DevelopersPlayground from '$lib/DevelopersPlayground.svelte';
	import AccountComponent from '$lib/AccountComponent.svelte';
	import SettingsComponent from '$lib/SettingsComponent.svelte';

	import { data } from '../store';
	import WiktionaryComponent from '$lib/WiktionaryComponent.svelte';
</script>

<div class="container h-full mx-auto items-center">
	<div
		class={`space-y-10 text-center flex flex-col items-center ${
			$data.current_page == 'about' ? 'block' : 'hidden'
		}`}
	>
		<GuideComponent />
	</div>
	<div
		class={`space-y-10 text-center flex flex-col items-center ${
			$data.current_page == 'presets' ? 'block' : 'hidden'
		}`}
	>
		<PresetForm />
	</div>
	<div
		class={`space-y-10 text-center flex flex-col items-center ${
			$data.current_page == 'add cards' ? 'block' : 'hidden'
		}`}
	>
		<NoteComponent />
	</div>
	<div
		class={`space-y-10 text-center flex flex-col items-center ${
			$data.current_page == 'export' ? 'block' : 'hidden'
		}`}
	>
		<DownloadComponent />
	</div>
	<div
		class={`space-y-10 text-center flex flex-col items-center ${
			$data.current_page == 'account' ? 'block' : 'hidden'
		}`}
	>
		<AccountComponent />
	</div>
	<div
		class={`space-y-10 text-center flex flex-col items-center ${
			$data.current_page == 'settings' ? 'block' : 'hidden'
		}`}
	>
		<SettingsComponent />
	</div>
	<div
		class={`space-y-2 text-center flex flex-col items-center ${
			$data.current_page == 'wiktionary' ? 'block' : 'hidden'
		}`}
	>
		<WiktionaryComponent />
	</div>
	<div
		class={`space-y-2 text-center flex flex-col items-center ${
			$data.current_page == 'developed' ? 'block' : 'hidden'
		}`}
	>
		<DevelopersPlayground />
	</div>
</div>
