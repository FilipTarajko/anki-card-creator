<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data } from '../store';
	import { getToastStore } from '@skeletonlabs/skeleton';

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
		for (let i = 0; i < field?.bindings.length; i++) {
			if (field?.bindings[i][0] == binding_value) {
				field.current_inputs = [structuredClone(field?.bindings[i][1])];
				return field?.bindings[i][1];
			}
		}
		field.current_inputs = [structuredClone(field.default)[0]];
		return field.default[0];
	}
</script>

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
				on:click={() => {
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
				}}
			>
				{preset.name}
			</button>
		{/each}
	</div>

	{#if selected_preset}
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
			on:submit={() => {
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
			}}
		>
			<div style="display: grid; grid-template-columns: 8.58rem 1fr 2.86rem 2.86rem;">
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
							<abbr title={`reset to '${field.default}'`}><i class="fa-solid fa-rotate-left" /></abbr>
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

						<!-- <button
						style="width: 2.574rem;"
						on:click={() => {
							field.currently_visible = !field.currently_visible;
						}}
						class="btn btn-large {field.currently_visible
							? `variant-filled${field.visible_by_default ? '' : '-primary'}`
							: `variant-ghost${field.visible_by_default ? '-primary' : ''}`}"
					>
						<div>
							{#if field.currently_visible}
								<i class="fa-solid fa-eye" />
							{:else}
								<i class="fa-solid fa-eye-slash" />
							{/if}
						</div>
					</button> -->
						<!-- </div> -->
					{/if}
				{/each}
			</div>
			<button
				type="submit"
				style="margin-top: 0.858rem;"
				class="btn btn-large variant-filled-success"
				>add card</button
			>
		</form>
		<div>
			current result: <pre>{current_output}</pre>
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

<style lang="postcss">
	input {
		color: black;
	}
</style>
