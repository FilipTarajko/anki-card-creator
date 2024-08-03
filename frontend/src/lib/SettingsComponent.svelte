<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { data, transformTextForDuplicateCheck } from '../store';

	const EXAMPLES_TO_SHOW = 10;

	let fileForUniqueness: any;
	let firstFields: string[][] = [];

	function tryUpdateUniquenessEntriesFromFile(shouldSave: boolean, shouldAppend: boolean = true) {
		console.time("tryReadFile")
		const file = fileForUniqueness[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			const data = e?.target?.result
			if (data as string && typeof data == "string") {
				const result = tryCreateNewUniquenessStateFromFile(data, shouldAppend);
				if (shouldSave) {
					$data.duplicate_checking_values_unsynced = result;
					localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify(result));
				}
			}
		}
		reader.readAsText(file);
		console.timeEnd("tryReadFile")
	}

	function tryCreateNewUniquenessStateFromFile(text: string, shouldAppend: boolean = true): string[] {
		console.time("tryParseStringFromFile")
		const rows = text.split("\n").slice(2);
		rows.pop();
		const rowsParsed: string[][] = [];
		for (let i = 0; i < rows.length; i++) {
			rowsParsed.push(rows[i].split("\t"));
		}
		const indices = [0, rowsParsed.length*0.25, rowsParsed.length*0.5, rowsParsed.length*0.75, rowsParsed.length-1]
		firstFields = [];
		indices.forEach(i => {
			firstFields.push(rowsParsed[Math.round(i)]);
		});
		let result: Set<string>
		if (shouldAppend) {
			result = new Set($data.duplicate_checking_values_unsynced);
		} else {
			result = new Set();
		}
		for (let i = 0; i < rowsParsed.length; i++) {
			const row = rowsParsed[i];
			for (let j = 0; j < row.length; j++) {
				let element = transformTextForDuplicateCheck(row[j], $data.duplicate_checking_removed_needles);

				if (element && $data.note_export_columns_for_duplicate_checking.includes(j)) {
					result.add(element)
				}
			}
		}
		console.timeEnd("tryParseStringFromFile")
		return Array.from(result);
	}

	function deleteLocalUniquenessEntries() {
		$data.duplicate_checking_values_unsynced = [];
		localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify([]));
	}
</script>

<h2 class="h2 mt-12">Settings</h2>
<h3 class="h3">Visual</h3>
<LightSwitch />
<h3 class="h3">Note field duplication warning</h3>
<img alt="export options" src="/ankiToCC.png">
<form class="flex flex-col gap-4 card p-4 w-3/4 max-w-2xl items-center">
	File for uniqueness checks:
	<input bind:files={fileForUniqueness} on:change={()=>{tryUpdateUniquenessEntriesFromFile(false)}} type="file">
	<div class="flex flex-row w-full justify-center gap-2">
		<button class="btn variant-filled-error" on:click={deleteLocalUniquenessEntries}>delete unsynced</button>
		<button class="btn variant-filled-warning" on:click={()=>{tryUpdateUniquenessEntriesFromFile(true, false)}}>overwrite</button>
		<button class="btn variant-filled-success" on:click={()=>{tryUpdateUniquenessEntriesFromFile(true)}}>append</button>
	</div>
	<table>
		{#each firstFields as row}
			<tr>
				{#each row as field, i}
					<td style={"padding: 0 0.6rem; " + (field ? "" : "color: gray;") + ($data.note_export_columns_for_duplicate_checking.includes(i) ? 'background: rgba(127, 255, 127, 0.2);' : '')}>{field || "-"}</td>
				{/each}
			</tr>
		{/each}
	</table>
	{#each [{elems: $data.duplicate_checking_values_synced, color: "green", name: "synced"}, {elems: $data.duplicate_checking_values_unsynced, color: "yellow", name: "unsynced"}] as part}
		<div style={`color: ${part.color};`}>
			currently {part.name} entries: {part.elems.length}
			<br>
			{#if part.elems.length > EXAMPLES_TO_SHOW}
				examples: {part.elems.slice(0, Math.floor(EXAMPLES_TO_SHOW/2)).join(", ")},
				...,
				{part.elems.slice(part.elems.length-Math.ceil(EXAMPLES_TO_SHOW/2), part.elems.length).join(", ")}
			{:else if part.elems.length}
				examples: {part.elems.join(", ")}
			{:else}
				no {part.name} entries
			{/if}
		</div>
	{/each}
</form>

<style scoped>
	table, td {
		border: 1px solid white;
		border-collapse: collapse;
	}
</style>
