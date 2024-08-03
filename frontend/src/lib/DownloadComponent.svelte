<script lang="ts">
	import { SlideToggle, getToastStore } from '@skeletonlabs/skeleton';
	import { data, showErrorToast, showSuccessToast } from '../store';
	import axios from 'axios';

	const toastStore = getToastStore();

	function download(filename: string, text: string) {
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		showSuccessToast($data.toastStore, 'Notes downloaded!');
	}

	function upload_notes() {
		axios
			.post($data.backend_url + '/upload_notes', JSON.stringify($data.notes_unsynced), {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.notes_synced = $data.notes_synced + $data.notes_unsynced;
				localStorage.setItem('notes_synced', $data.notes_synced);
				$data.notes_unsynced = '';
				localStorage.setItem('notes_unsynced', '');
				console.log(response);
				showSuccessToast($data.toastStore, 'Notes uploaded!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast($data.toastStore, 'Notes upload failed!');
			});
	}

	function delete_notes() {
		axios
			.post($data.backend_url + '/delete_notes', '', {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.notes_synced = '';
				localStorage.setItem('notes_synced', '');
				$data.notes_unsynced = '';
				localStorage.setItem('notes_unsynced', '');
				showSuccessToast($data.toastStore, 'Local and cloud notes deleted!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast($data.toastStore, 'Notes deletion failed!');
			});
	}

	function sync_notes() {
		axios
			.post($data.backend_url + '/sync_notes', JSON.stringify($data.notes_unsynced), {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.notes_synced = response.data;
				localStorage.setItem('notes_synced', $data.notes_synced);
				$data.notes_unsynced = '';
				localStorage.setItem('notes_unsynced', '');
				showSuccessToast($data.toastStore, 'Notes synced!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast($data.toastStore, 'Notes sync failed!');
			});
	}
</script>

<h2 class="h2 mt-12">Data to download</h2>
{#if $data.notes_synced || $data.notes_unsynced}
	<div class="card text-left p-4 variant-ghost">
		{#if $data.display_csv_headers}
			<pre style="color: gray;">{$data.prefix_for_exports.slice(0, -1)}</pre>
		{/if}
		<pre style="color: green;">{$data.notes_synced.slice(0, -1)}</pre>
		<pre style="color: yellow;">{$data.notes_unsynced.slice(0, -1)}</pre>
	</div>
{:else}
	<div class="card p-4 variant-ghost-warning">
		<pre>nothing to download</pre>
	</div>
{/if}
<div>
	data to download: {$data.notes_synced.split('\n').length +
		$data.notes_unsynced.split('\n').length -
		2} notes (
	<span style="color: green;">
		{$data.notes_synced.split('\n').length - 1}
	</span>
	+
	<span style="color: yellow">
		{$data.notes_unsynced.split('\n').length - 1}
	</span>
	)
</div>
<div class="space-y-2 flex flex-col items-center">
	<div>
		<button
			disabled={!$data.notes_synced && !$data.notes_unsynced}
			class={`btn-icon ${
				$data.notes_synced || $data.notes_unsynced
					? 'variant-filled-success'
					: 'variant-soft-success'
			}`}
			on:click={() => {
				let to_download = $data.prefix_for_exports;
				if ($data.notes_unsynced) {
					to_download += $data.notes_synced + $data.notes_unsynced.slice(0, -1);
				} else {
					to_download += $data.notes_synced.slice(0, -1);
				}
				download('AnkiCC.txt', to_download);
			}}
		>
			<i class="fa-solid fa-download" />
		</button>
		<button class="btn-icon variant-filled-success" on:click={upload_notes}>
			<i class="fa-solid fa-cloud-arrow-up" /></button
		>
		<button class="btn-icon variant-filled-success" on:click={sync_notes}>
			<i class="fa-solid fa-rotate" /></button
		>
	</div>
	<button
		class="btn variant-filled-primary"
		on:click={() => {
			$data.notes_synced = '';
			localStorage.setItem('notes_synced', $data.notes_synced);
			$data.notes_unsynced = '';
			localStorage.setItem('notes_unsynced', $data.notes_unsynced);
			showSuccessToast($data.toastStore, 'Local notes deleted!');
		}}
	>
		<!-- <i class="fa-solid fa-remove" /> -->
		delete local notes
	</button>
	<button class="btn variant-filled-primary" on:click={delete_notes}
		>delete local and cloud notes</button
	>
</div>
<div>
	Press <kbd class="kbd">Ctrl + Shift + i</kbd> in Anki to open import window.
	<br />
	<br />
	<SlideToggle name="slide" active="bg-success-500" bind:checked={$data.display_csv_headers}
		>display <abbr title="data added to file for Anki to understand the file during import"
			>file headers</abbr
		></SlideToggle
	>
	<br />
	<span style="color: green;">green text</span> - synced notes
	<br />
	<span style="color: yellow;">yellow text</span> - unsynced notes
	<div class="card mt-4 p-4 variant-ghost-warning">
		Note: Anki 2.1.55 (2022-12-16) or newer is <abbr
			title="file will contain headers supported (after tweaking settings) since 2.1.54 and supported by default since 2.1.55"
			>expected</abbr
		>.
	</div>
</div>
