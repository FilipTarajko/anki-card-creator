<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data } from '../store';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { BindingType, type Field, type Preset } from '../types';
	import IframesComponent from './IframesComponent.svelte';

	const toastStore = getToastStore();

	function showSuccessToast(message: string) {
		toastStore.trigger({
			message,
			timeout: 5000,
			background: 'variant-filled-success',
			autohide: true,
			hideDismiss: false
		});
	}

	let currently_all_forced_visible: boolean = false;
	let selected_preset: Preset | null = null;
	let current_output: string = '';

	function sanitize(text: String) {
		if (!text) {
			return '';
		}
		text = text.replaceAll('"', '""');
		if (text.includes(';')) {
			text = '"' + text + '"';
		}
		return text;
	}

	// @ts-ignore
	$: did_current_preset_change = (selected_preset ?? false ) && !$data.presets.some((preset)=>preset.last_edited === selected_preset?.last_edited);

	$: {
		if (selected_preset) {
			let output = '';
			selected_preset.fields.forEach((field) => {
				if (field.type == 'bound') {
					// @ts-ignore
					output += sanitize(calculate_result_of_bound_field(field));
				} else {
					output += sanitize(field.current_inputs.join(' '));
				}
				output += ';';
			});
			current_output = output.slice(0, -1);
		}
	}

	function calculate_result_of_bound_field(field: Field) {
		if (!field.bindings || !selected_preset?.fields) {
			field.current_inputs = [structuredClone(field.default)[0]];
			return field.default[0];
		}

		let binding_value = null;
		for (let i = 0; i < selected_preset?.fields?.length; i++) {
			if (field.bound_to == selected_preset?.fields[i].id) {
				binding_value = selected_preset?.fields[i].current_inputs[0];
				break;
			}
		}

		if (binding_value) {
			for (let i = 0; i < field?.bindings.length; i++) {
				const matchedByRegex = field?.binding_type === BindingType.REGEX && new RegExp(field?.bindings[i][0]).test(binding_value);
				const matchedByStarts = field?.binding_type === BindingType.STARTS && binding_value?.startsWith(field?.bindings[i][0]);
				const matchedByEnds = field?.binding_type === BindingType.ENDS && binding_value?.endsWith(field?.bindings[i][0]);
				const matchedByContains = field?.binding_type === BindingType.CONTAINS && binding_value?.includes(field?.bindings[i][0]);
				const matchedByEquals = (!field?.binding_type || field?.binding_type === BindingType.EQUALS) && field?.bindings[i][0] == binding_value;
				if (matchedByRegex || matchedByStarts || matchedByEnds || matchedByContains || matchedByEquals) {
					field.current_inputs = [structuredClone(field?.bindings[i][1])];
					return field?.bindings[i][1];
				}
			}
		}

		field.current_inputs = [structuredClone(field.default)[0]];
		return field.default[0];
	}

	function calculateIframeWithReplacements() {
		if (!selected_preset || !iframe_source_template) {
			return '';
		}
		let str = iframe_source_template;
		for (let i = 0; i<selected_preset.fields.length; i++) {
			const field = selected_preset.fields[i];
			while (str.match(`\\$\{${field.name}[^\}]*\}`)) {
				const match = str.match(`\\$\{${field.name}[^\}]*\}`);
				let toReplaceWith = '';

				if (field.type == 'bound') {
					toReplaceWith = calculate_result_of_bound_field(field)
				} else {
					toReplaceWith = field.current_inputs.join(' ');
				}

				if (match![0].includes('.skipFirstWord')) {
					toReplaceWith = toReplaceWith.replace(/^[^\s]*\s/, '');
				}

				str = str.replace(new RegExp(`\\$\{${field.name}[^\}]*\}`), toReplaceWith);
			}
		}
		return str;
	};

	let iframe_source_template = '';

	function selectPreset(preset: Preset) {
		selected_preset = JSON.parse(JSON.stringify(preset));
		if (selected_preset) {
			for (let i = 0; i < selected_preset.fields.length; i++) {
				selected_preset.fields[i].current_inputs = JSON.parse(
					JSON.stringify(selected_preset?.fields[i].default)
				);
				selected_preset.fields[i].currently_frozen =
					selected_preset.fields[i].frozen_by_default;
				selected_preset.fields[i].currently_visible =
					selected_preset.fields[i].visible_by_default;
			}
		}
		iframe_source_template = selected_preset?.iframes?.length && selected_preset.iframes[0][1] || '';
	}

	function addNote() {
		showSuccessToast('Note added!');
		$data.notes_unsynced +=
			current_output +
			`
`;
		if (selected_preset?.fields?.length) {
			for (let i = 0; i < selected_preset?.fields?.length || 0; i++) {
				if (!selected_preset?.fields[i].currently_frozen) {
					selected_preset.fields[i].current_inputs = JSON.parse(
						JSON.stringify(selected_preset?.fields[i].default)
					);
				}
			}
		}
		localStorage.setItem('notes_unsynced', $data.notes_unsynced);
	}

	// @ts-ignore
	$: current_presets_hue_as_number = Math.floor(selected_preset?.hue || 0);

	$: iframe_with_replacements = selected_preset && iframe_source_template && calculateIframeWithReplacements();


let cardFormWidth: number;
let layoutWidth: number;
let innerWidth: number;
let innerHeight: number;

$: twoColumnsCondition = layoutWidth-cardFormWidth>330;

</script>

<svelte:window bind:innerHeight bind:innerWidth />
<div class="w-full" bind:clientWidth={layoutWidth} />

<div class={`flex w-full ${selected_preset?.iframes?.length ? 'w-full' : ''} ${twoColumnsCondition ? 'space-x-0 flex-row' : 'flex-col space-y-10'}`}>
	<div class='space-y-10 text-center flex flex-col items-center'>
		<h2 class="h2 mt-12">Create a card</h2>
		{#if $data.presets.length}
			<!-- TODO -->
			<!-- <RadioGroup class="card">
				{#each $data.presets as preset}
					<RadioItem
						class={`${selected_preset?.name !== preset.name ? 'variant-ghost' : ''}`}
						bind:group={selected_preset}
						name="type"
						value={preset}>{preset.name}</RadioItem
					>
				{/each}
			</RadioGroup> -->
			<div class="card p-2 ml-6 mr-6">
				{#each $data.presets as preset}
					<button
						style={`color: hsl(${preset.hue} ${
							selected_preset?.name == preset.name
								? '100% 20%); background-color: hsl(' + preset.hue + ' 100% 87%);'
								: '70% 50%);'
						}`}
						class={`btn ${
							selected_preset?.name == preset.name ? 'variant-filled' : 'variant-ghost'
						} m-0.5`}
						on:click={()=>selectPreset(preset)}
					>
						{preset.name}
					</button>
				{/each}
			</div>

			{#if selected_preset}
				{#if did_current_preset_change}
					<div class="card p-4 variant-ghost-error">
						The current preset has been updated! To load the changes, press its name again. Current input will be lost!
					</div>
				{/if}

				<!-- {#if selected_preset?.iframes?.length}
					<IframesComponent selected_preset />
				{/if} -->

				<div class="card p-4 variant-ghost-secondary">
					force each field visible
					<button
						type="button"
						class={`btn-icon variant-filled${currently_all_forced_visible ? '-warning' : ''}`}
						style="font-weight: bold;"
						on:click={() => {
							currently_all_forced_visible = !currently_all_forced_visible;
						}}
					>
						{#if currently_all_forced_visible}
							<i class="fa-solid fa-eye" />
						{:else}
							<i class="fa-solid fa-eye-slash" />
						{/if}
					</button>
				</div>
				<form
					bind:clientWidth={cardFormWidth}
					on:submit={addNote}
				>
					<div style={`display: grid; grid-template-columns: 8.58rem 1fr 2.86rem 2.86rem${currently_all_forced_visible ?  ' 2.86rem' : ''};`}>
						{#each selected_preset.fields as field}
							{#if field.currently_visible || currently_all_forced_visible}
								<div style="display: flex; justify-content: center; align-items: center;">
									{field.name}
								</div>
								{#if field.type === 'text'}
									<input type="text" bind:value={field.current_inputs[0]} />
								{:else if field.type === 'selectOne'}
									<RadioGroup>
										{#each field.options as option}
											<RadioItem bind:group={field.current_inputs[0]} name="type" value={option}
												>{option || '(empty)'}</RadioItem
											>
										{/each}
									</RadioGroup>
								{:else if field.type === 'selectMany'}
									<ListBox multiple>
										<div class="card" style="display: flex; flex-direction: row;">
											{#each field.options as option}
												<ListBoxItem bind:group={field.current_inputs} name="type" value={option}
													>{option || '(empty)'}</ListBoxItem
												>
											{/each}
										</div>
									</ListBox>
								{:else if field.type === 'bound'}
									<div style="display: flex; justify-content: center; align-items: center;">
										{calculate_result_of_bound_field(field)} (default: {field.default[0] || '(empty)'})
									</div>
								{/if}
								<button
									style="width: 2.574rem;"
									class="btn btn-large variant-filled"
									type="button"
									on:click={() => {
										field.current_inputs = JSON.parse(JSON.stringify(field.default));
									}}
								>
									<abbr title={`reset to '${field.default}'`}
										><i class="fa-solid fa-rotate-left" /></abbr
									>
								</button>
								<button
									style="width: 2.574rem;"
									class="btn btn-large {!field.currently_frozen ? 'variant-filled' : 'variant-ghost'}"
									type="button"
									on:click={() => {
										field.currently_frozen = !field.currently_frozen;
									}}
								>
									<abbr title={`reset to '${field.default}'`}>
										{#if field.currently_frozen}
											<i class="fa-solid fa-lock" />
										{:else}
											<i class="fa-solid fa-lock-open" />
										{/if}
									</abbr>
								</button>
								{#if currently_all_forced_visible}
									<button
									style="width: 2.574rem;"
									on:click={() => {
										field.currently_visible = !field.currently_visible;
									}}
									class="btn btn-large {field.currently_visible
										? `variant-filled${field.visible_by_default ? '' : '-warning'}`
										: `variant-ghost${field.visible_by_default ? '-warning' : ''}`}"
								>
									<div>
										{#if field.currently_visible}
											<i class="fa-solid fa-eye" />
										{:else}
											<i class="fa-solid fa-eye-slash" />
										{/if}
									</div>
								</button>
								{/if}
							{/if}
						{/each}
					</div>
					<button
						type="submit"
						style="margin-top: 0.858rem;"
						class="btn btn-large variant-filled-success">add card</button
					>
				</form>
				<div style="max-width: 30rem; line-break: anywhere;">
					current result: <br><span>{current_output}</span>
				</div>
			{/if}
		{:else}
			<div class="card mt-12 variant-ghost-warning p-4">
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				You have no presets yet! Create them in the
				<span
					style="cursor: pointer;"
					on:click={() => {
						$data.current_page = 'presets';
						localStorage.setItem('current_page', 'presets');
					}}>"<u>presets</u>"</span
				> tab.
			</div>
		{/if}
	</div>
	{#if selected_preset?.iframes?.length}
		<IframesComponent bind:iframe_source_template {selected_preset} {current_presets_hue_as_number} {iframe_with_replacements} />
	{/if}
</div>

<style lang="postcss">
	input {
		color: black;
	}
</style>
