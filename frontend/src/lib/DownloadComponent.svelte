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
{#if $data.string_for_export}
	<div class="card p-4 variant-ghost">
		<pre>{$data.string_for_export}</pre>
	</div>
{:else}
	<div class="card p-4 variant-ghost-warning">
		<pre>nothing to download</pre>
	</div>
{/if}
<div class="mt-0">
	<button
		disabled={!$data.string_for_export}
		class={`btn-icon ${
			$data.string_for_export ? 'variant-filled-success' : 'variant-soft-success'
		}`}
		on:click={() => {
			download('AnkiCC.txt', $data.prefix_for_exports + $data.string_for_export.slice(0, -1));
		}}
	>
		<i class="fa-solid fa-download" />
	</button>
	<button
		class="btn-icon variant-filled-primary"
		on:click={() => {
			$data.string_for_export = '';
			localStorage.setItem('string_for_export', $data.string_for_export);
		}}
	>
		<i class="fa-solid fa-remove" />
	</button>
</div>
