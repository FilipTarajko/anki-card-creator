<script lang="ts">
	import { LightSwitch, SlideToggle } from '@skeletonlabs/skeleton';
	import { data, showSuccessToast, showErrorToast, transformTextForDuplicateCheck } from '../store';
	import axios from 'axios';

	const EXAMPLES_TO_SHOW = 10;

	let fileForUniqueness: any;
	let firstFields: string[][] = [];

	function tryUpdateUniquenessEntriesFromFile(shouldSave: boolean, shouldAppend: boolean = true) {
		console.time("tryReadFile")
		if (!fileForUniqueness?.length) {
			showErrorToast($data.toastStore, "No file selected!");
			return;
		}
		const file = fileForUniqueness[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			const data = e?.target?.result
			if (data as string && typeof data == "string") {
				const result = tryCreateNewUniquenessStateFromFile(data, shouldAppend);
				if (shouldSave) {
					$data.duplicate_checking_values_unsynced = result;
					localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify(result));
					showSuccessToast($data.toastStore, shouldAppend ? "Appended to unique question list" : "Overwritten unique questions list");
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

	function deleteAllUniquenessEntries() {
		axios
			.post($data.backend_url + '/delete_unique_questions', '', {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.duplicate_checking_values_synced = [];
				localStorage.setItem("duplicate_checking_values_synced", JSON.stringify([]));
				$data.duplicate_checking_values_unsynced = [];
				localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify([]));
				showSuccessToast($data.toastStore, 'Unique question list deleted!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast($data.toastStore, 'Deleting unique question list failed!');
			});
	}

	function deleteLocalUniquenessEntries() {
		$data.duplicate_checking_values_unsynced = [];
		localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify([]));
		showSuccessToast($data.toastStore, "Deleted unsynced unique questions list");
	}

	$: note_export_uniqueness_selectable_columns = firstFields[0];
	$: note_export_uniqueness_selected_columns = (note_export_uniqueness_selectable_columns ?? []).map((elem, i) => {
		if ($data.note_export_columns_for_duplicate_checking.includes(i)) {
			return true;
		}
		return false;
	});

	function toggleNoteExportColumnForDuplicateChecking(i: number) {
		if (!$data.note_export_columns_for_duplicate_checking.includes(i)) {
			$data.note_export_columns_for_duplicate_checking.push(i)
		} else {
			$data.note_export_columns_for_duplicate_checking = $data.note_export_columns_for_duplicate_checking.filter((elem: number)=>elem!=i)
		}
		localStorage.setItem('note_export_columns_for_duplicate_checking', JSON.stringify($data.note_export_columns_for_duplicate_checking));
	}
</script>

<h2 class="h2 mt-12">Settings</h2>
<h3 class="h3">Visual</h3>
<LightSwitch />
<h3 class="h3">Note field duplication warning</h3>
<img alt="export options" src="/ankiToCC.png">
<form class="flex flex-col gap-4 card p-4 w-11/12 max-w-2xl items-center">
	File for uniqueness checks:
	<input bind:files={fileForUniqueness} on:change={()=>{tryUpdateUniquenessEntriesFromFile(false)}} type="file">
	<div class="flex flex-row w-full justify-center gap-2">
		<button class="btn variant-filled-primary" on:click={deleteLocalUniquenessEntries}>delete unsynced</button>
		<button class="btn variant-filled-warning" on:click={()=>{tryUpdateUniquenessEntriesFromFile(true, false)}}>overwrite</button>
		<button class="btn variant-filled-success" on:click={()=>{tryUpdateUniquenessEntriesFromFile(true)}}>append</button>
	</div>
	<table>
		{#if note_export_uniqueness_selectable_columns}
			<tr>
				{#each firstFields[0] as _, i}
					<td style={"padding: 0.4rem 0.2rem 0; " + ($data.note_export_columns_for_duplicate_checking.includes(i) ? 'background: rgba(127, 255, 127, 0.2);' : '')}>
						<SlideToggle
							type="checkbox"
							name="slide"
							size="sm"
							value={i}
							on:click={()=>{toggleNoteExportColumnForDuplicateChecking(i)}}
							bind:checked={note_export_uniqueness_selected_columns[i]}
						/>
					</td>
				{/each}
			</tr>
		{/if}
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
	<div class="flex flex-row w-full justify-center gap-2">
		<button class="btn variant-filled-primary" on:click={deleteAllUniquenessEntries}>delete all</button>
		<button class="btn-icon variant-filled-success" on:click={data.sync_unique_questions}>
			<i class="fa-solid fa-rotate" />
		</button>
	</div>
</form>

<style scoped>
	table, td {
		border: 1px solid white;
		border-collapse: collapse;
	}
</style>
