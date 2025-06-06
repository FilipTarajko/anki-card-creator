<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import { data } from '../store';

	function download(filename: string, text: string) {
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		data.showSuccessToast('Notes downloaded!');
	}

	function locallyDeleteLastNote() {
		if ($data.notes_unsynced && $data.notes_unsynced.includes('\n')) {
			const notes_being_processed = $data.notes_unsynced.split('\n');
			notes_being_processed.pop();
			const removed_note = notes_being_processed.pop();
			notes_being_processed.push('');
			const new_notes_unsynced = notes_being_processed.join('\n');
			data.update((c) => {
				return {...c, notes_unsynced: new_notes_unsynced}
			})
			localStorage.setItem('notes_unsynced', new_notes_unsynced);
			data.showSuccessToast(`Last (unsynced) note deleted!<br>${removed_note}`);
		} else if ($data.notes_synced && $data.notes_synced.includes('\n')) {
			const notes_being_processed = $data.notes_synced.split('\n');
			notes_being_processed.pop();
			const removed_note = notes_being_processed.pop();
			notes_being_processed.push('');
			const new_notes_synced = notes_being_processed.join('\n');
			data.update((c) => {
				return {...c, notes_synced: new_notes_synced}
			})
			localStorage.setItem('notes_synced', new_notes_synced);
			data.showSuccessToast(`Last (synced) note deleted!<br>${removed_note}`);
		} else {
			data.showErrorToast('No notes to delete!');
		}
	}
</script>

<h2 class="h2 mt-12">Data to download</h2>
{#if $data.notes_synced || $data.notes_unsynced}
	<div class="max-w-full">
		<div class="card text-left p-4 variant-ghost max-w-full mx-4 overflow-x-auto">
			{#if $data.display_csv_headers}
			<pre style="color: gray;">{$data.prefix_for_exports.slice(0, -1)}</pre>
			{/if}
			<pre style="color: green;">{$data.notes_synced.slice(0, -1)}</pre>
			<pre style="color: yellow;">{$data.notes_unsynced.slice(0, -1)}</pre>
		</div>
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
		<button class="btn-icon variant-filled-success" on:click={data.upload_notes}>
			<i class="fa-solid fa-cloud-arrow-up" /></button
		>
		<button class="btn-icon variant-filled-success" on:click={data.sync_notes}>
			<i class="fa-solid fa-rotate" /></button
		>
	</div>
	<button
			class="btn variant-filled-warning"
			on:click={locallyDeleteLastNote}
	>
		(locally) delete last note
	</button>
	<button
		class="btn variant-filled-primary"
		on:click={() => {
			data.update((c)=>{return{...c, notes_synced: '', notes_unsynced: ''}})
			localStorage.setItem('notes_synced', '');
			localStorage.setItem('notes_unsynced', '');
			data.showSuccessToast('Local notes deleted!');
		}}
	>
		<!-- <i class="fa-solid fa-remove" /> -->
		delete local notes
	</button>
	<button class="btn variant-filled-primary" on:click={data.delete_notes}
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
