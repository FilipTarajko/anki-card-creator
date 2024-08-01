<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { data, removeNeedlesForDuplicateCheck } from '../store';

	let fileForUniqueness: any;
	let firstFields: string[][] = [];

	function tryReadFile(shouldSave: boolean) {
		console.time("tryReadFile")
		const file = fileForUniqueness[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			const data = e?.target?.result
			if (data as string && typeof data == "string") {
				const result = tryParseStringFromFile(data);
				if (shouldSave) {
					$data.duplicate_checking_values = result;
					localStorage.setItem("duplicate_checking_values", JSON.stringify(result));
				}
			}
		}
		reader.readAsText(file);
		console.timeEnd("tryReadFile")
	}

	function tryParseStringFromFile(text: string): string[] {
		console.time("tryParseStringFromFile")
		const rows = text.split("\n").slice(2);
		rows.pop();
		const rowsParsed: string[][] = [];
		for (let i = 0; i < rows.length; i++) {
			rowsParsed.push(rows[i].split("\t"));
		}
		const indices = [0, rowsParsed.length*0.75, rowsParsed.length*0.5, rowsParsed.length*0.75, rowsParsed.length-1]
		firstFields = [];
		indices.forEach(i => {
			firstFields.push(rowsParsed[Math.round(i)]);
		});
		const result: Set<string> = new Set()
		for (let i = 0; i < rowsParsed.length; i++) {
			const row = rowsParsed[i];
			for (let j = 0; j < row.length; j++) {
				let element = removeNeedlesForDuplicateCheck(row[j], $data.duplicate_checking_removed_needles);

				if (element && $data.note_export_columns_for_duplicate_checking.includes(j)) {
					result.add(element)
				}
			}
		}
		console.timeEnd("tryParseStringFromFile")
		return Array.from(result);
	}
</script>

<h2 class="h2 mt-12">Settings</h2>
<h3 class="h3">Visual</h3>
<LightSwitch />
<h3 class="h3">Note field duplication warning</h3>
<img alt="export options" src="/ankiToCC.png">
<form class="flex flex-col gap-4 card p-4 w-3/4">
	File for uniqueness checks:
	<input bind:files={fileForUniqueness} on:change={()=>{tryReadFile(false)}} type="file">
	<button class="btn variant-filled" on:click={()=>{tryReadFile(true)}}>save</button>
	<table>
		{#each firstFields as row}
			<tr>
				{#each row as field, i}
					<td style={"padding: 0 0.6rem; " + (field ? "" : "color: gray;") + ($data.note_export_columns_for_duplicate_checking.includes(i) ? 'background: rgba(127, 255, 127, 0.2);' : '')}>{field || "-"}</td>
				{/each}
			</tr>
		{/each}
	</table>
	currently known entries: {$data.duplicate_checking_values.length}
	<br>
	currently known entries examples: {$data.duplicate_checking_values.slice(0, 20).join(", ")}
</form>

<style scoped>
	table, td {
		border: 1px solid white;
		border-collapse: collapse;
	}
</style>