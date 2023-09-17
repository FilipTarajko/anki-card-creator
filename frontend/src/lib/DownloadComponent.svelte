<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data } from '../store';

	function download(filename: string, text: string) {
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
</script>

<h2 class="h2 mt-12">Data to download</h2>
<pre class="card p-4 variant-ghost">{$data.prefix_for_exports}</pre>
{#if $data.notes_synced || $data.notes_unsynced}
	<div class="card p-4 variant-ghost">
		<pre>{$data.notes_synced}</pre>
	</div>
	<div class="card p-4 variant-ghost">
		<pre>{$data.notes_unsynced}</pre>
	</div>
{:else}
	<div class="card p-4 variant-ghost-warning">
		<pre>nothing to download</pre>
	</div>
{/if}
<div class="mt-0">
	<button
		disabled={!$data.notes_synced && !$data.notes_unsynced}
		class={`btn-icon ${
			$data.notes_synced || $data.notes_unsynced ? 'variant-filled-success' : 'variant-soft-success'
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
	<button
		class="btn-icon variant-filled-primary"
		on:click={() => {
			$data.notes_synced = '';
			localStorage.setItem('notes_synced', $data.notes_synced);
			$data.notes_unsynced = '';
			localStorage.setItem('notes_unsynced', $data.notes_unsynced);
		}}
	>
		<i class="fa-solid fa-remove" />
	</button>
</div>
