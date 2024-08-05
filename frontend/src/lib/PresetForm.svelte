<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data, showErrorToast, showSuccessToast, default_fields } from '../store';
	import { BindingType, type Field, type Preset } from '../types';
	import { get } from 'svelte/store';

	let is_iframe_list_visible = false;
	let preset_name = 'new preset';
	let preset_iframes: [string, string][] = [['source', '${source}']];
	let selected_hue: string = '';
	let new_field_name = '';
	let new_field_type: 'text' | 'selectOne' | 'selectMany' | null = null;

	function create_field() {
		$data.fields = [
			...$data.fields,
			{
				id: $data.fields.length,
				name: new_field_name,
				type: new_field_type ?? 'text',
				options: [],
				default: [],
				visible_by_default: true,
				frozen_by_default: true,
				current_inputs: []
			}
		];
		new_field_name = '';
		new_field_type = null;
	}

	function validate_and_prepare_fields() {
		for (let i = 0; i < $data.fields.length; i++) {
			if (
				$data.fields[i].options.length < 2 &&
				($data.fields[i].type == 'selectOne' || $data.fields[i].type == 'selectMany')
			) {
				showErrorToast($data.toastStore, 'Select fields must have at least 2 options!');
				return false;
			}
			$data.fields[i].current_inputs = [];
		}
		return true;
	}
	$data.presets = $data.presets;

	function save_preset_as_new() {
		if (!preset_name) {
			showErrorToast($data.toastStore, "Please enter preset's name");
		} else if (
			// @ts-ignore
			$data.presets.find((e) => e.name.toLowerCase().trim() === preset_name.toLowerCase().trim())
		) {
			showErrorToast($data.toastStore, 'Preset with this name already exists!');
		} else if (!validate_and_prepare_fields()) {
			return;
		} else {
			$data.presets.push(
				{
					name: preset_name,
					iframes: preset_iframes,
					fields: JSON.parse(JSON.stringify($data.fields)),
					last_edited: new Date().getTime(),
					status: 'unsynced',
					hue: selected_hue
				}
			);
			localStorage.setItem('presets', JSON.stringify($data.presets));
			showSuccessToast($data.toastStore, `Preset "${preset_name}" saved!`);
		}
	}

	function update_preset() {
		console.log($data.presets)
		if (!$data.selected_preset) {
			console.error('selected_preset is null');
		} else if (!preset_name) {
			showErrorToast($data.toastStore, "Please enter preset's name");
		} else if (
			// @ts-ignore
			$data.presets.find(
				(e: Preset) =>
					e.name.toLowerCase().trim() === preset_name.toLowerCase().trim() && e !== $data.selected_preset
			)
		) {
			showErrorToast($data.toastStore, 'Preset with this name already exists!');
		} else if (!validate_and_prepare_fields()) {
			return;
		} else {
			// @ts-ignore
			let old_preset_name = get(data).selected_preset?.name;
			
			// @ts-ignore
			data.update((c)=>{return {...c, selected_preset: {...(c.selected_preset), iframes: preset_iframes, fields: $data.fields, name: preset_name, last_edited: new Date().getTime(), hue: selected_hue, status: 'to_update'}}})
			data.update((c)=>{
				let newPresets = structuredClone(c.presets);
				newPresets = newPresets.filter(e=>e.name != old_preset_name);
				// @ts-ignore
				newPresets.push(c.selected_preset);
				localStorage.setItem('presets', JSON.stringify(newPresets));
				return {...c, presets: newPresets}
			});
			if (old_preset_name == preset_name) {
				showSuccessToast($data.toastStore, `Preset "${preset_name}" updated!`);
			} else {
				showSuccessToast($data.toastStore, `Preset "${old_preset_name}" updated as "${preset_name}"!`);
			}
		}
	}

	function add_missing_bindings(field: Field) {
		if (!field.bindings || !$data.fields) {
			return;
		}
		let binding_field = null;
		for (let i = 0; i < $data.fields?.length; i++) {
			if (field.bound_to == $data.fields[i].id) {
				binding_field = $data.fields[i];
				break;
			}
		}
		if (!binding_field) {
			return;
		}
		let to_check: string[] = [];
		console.log(binding_field.type);
		switch (binding_field.type) {
			case 'text':
				to_check = [binding_field.default[0]];
				break;
			case 'selectOne': // fall-through for both selectOne and selectMany
			case 'selectMany':
				to_check = binding_field.options;
				console.log(binding_field.options);
				break;
			case 'bound':
				// @ts-ignore
				to_check = binding_field?.bindings.map((e) => e[1]);
				break;
			default:
				to_check = [];
				break;
		}
		loop_outer: for (let i = 0; i < to_check.length; i++) {
			for (let j = 0; j < field.bindings.length; j++) {
				if (field.bindings[j][0] == to_check[i]) {
					console.log(to_check[i]);
					continue loop_outer;
				}
			}
			field.bindings.push([to_check[i], '']);
		}
		$data.fields = $data.fields;
	}
</script>

<h2 class="h2 mt-12">Create a card preset</h2>
<div class="card p-2 ml-6 mr-6">
	{#each $data.presets as preset}
		<button
			style={`color: hsl(${preset.hue} ${
			// @ts-ignore
				$data.selected_preset?.name == preset.name
					? '100% 20%); background-color: hsl(' + preset.hue + ' 100% 87%);'
					: '70% 50%);'
			}`}
			class={`btn ${
			// @ts-ignore
				$data.selected_preset?.name == preset.name ? 'variant-filled' : 'variant-ghost'
			} m-0.5`}
			on:click={() => {
				preset_name = preset.name;
				preset_iframes = preset.iframes ?? [];
				$data.fields = JSON.parse(JSON.stringify(preset.fields));
				$data.selected_preset = preset;
				selected_hue = preset.hue;
			}}
		>
			{preset.name}
		</button>
	{/each}
	{#if $data.presets.length}
		<br />
	{/if}
	<button
		class={`btn ${!$data.selected_preset ? 'variant-filled' : 'variant-ghost'} m-0.5`}
		on:click={() => {
			preset_name = 'new preset';
			preset_iframes = [];
			$data.fields = JSON.parse(JSON.stringify(default_fields));
			selected_hue = '';
			$data.selected_preset = null;
		}}
	>
		<b><i>new preset</i></b>
	</button>
</div>
<div class="card p-4">
	<button
		class={`btn-icon ${
			$data.selected_preset && $data.presets.indexOf($data.selected_preset) > 0
				? 'variant-filled'
				: 'variant-ghost'
		} m-0.5`}
		on:click={() => {
			if ($data.selected_preset && $data.presets.indexOf($data.selected_preset) > 0) {
				// @ts-ignore
				$data.presets = $data.presets.filter((p) => p !== $data.selected_preset);
				$data.presets.unshift($data.selected_preset);
				localStorage.setItem('presets', JSON.stringify($data.presets));
			}
		}}
		><i class="fa-solid fa-angles-left" />
	</button>
	<button
		class={`btn-icon ${
			$data.selected_preset && $data.presets.indexOf($data.selected_preset) > 0
				? 'variant-filled'
				: 'variant-ghost'
		} m-0.5`}
		on:click={() => {
			if ($data.selected_preset && $data.presets.indexOf($data.selected_preset) > 0) {
				// @ts-ignore
				let index = $data.presets.indexOf($data.selected_preset);
				let temp = $data.presets[index - 1];
				$data.presets[index - 1] = $data.selected_preset;
				$data.presets[index] = temp;
				localStorage.setItem('presets', JSON.stringify($data.presets));
			}
		}}
		><i class="fa-solid fa-chevron-left" />
	</button>
	<button
		type="button"
		class={`btn-icon ${$data.selected_preset ? 'variant-filled-primary' : 'variant-ghost-primary'} m-0.5`}
		style="font-weight: bold;"
		on:click={() => {
			const currentData = get(data);
			// @ts-ignore
			if (currentData.selected_preset?.status !== 'unsynced' && currentData.selected_preset?._id) {
			// @ts-ignore
				currentData.ids_of_presets_to_remove.push($data.selected_preset?._id);
				data.update((c)=>{return {...c, ids_of_presets_to_remove: currentData.ids_of_presets_to_remove}})
				localStorage.setItem(
					'ids_of_presets_to_remove',
					JSON.stringify(currentData.ids_of_presets_to_remove)
				);
			}
			// @ts-ignore
			data.update((c)=>{
				const newPresets = currentData.presets.filter((p) => p !== $data.selected_preset)
				console.log(newPresets)
				return {...c, presets: newPresets, selected_preset: null}
			});
			localStorage.setItem('presets', JSON.stringify(get(data).presets));
		}}
	>
		<i class="fa-solid fa-remove" />
	</button>
	<button
		class={`btn-icon ${
			$data.selected_preset && $data.presets.indexOf($data.selected_preset) < $data.presets.length - 1
				? 'variant-filled'
				: 'variant-ghost'
		} m-0.5`}
		on:click={() => {
			if ($data.selected_preset && $data.presets.indexOf($data.selected_preset) < $data.presets.length - 1) {
				// @ts-ignore
				let index = $data.presets.indexOf($data.selected_preset);
				let temp = $data.presets[index + 1];
				$data.presets[index + 1] = $data.selected_preset;
				$data.presets[index] = temp;
				localStorage.setItem('presets', JSON.stringify($data.presets));
			}
		}}
		><i class="fa-solid fa-chevron-right" />
	</button>
	<button
		class={`btn-icon ${
			$data.selected_preset && $data.presets.indexOf($data.selected_preset) < $data.presets.length - 1
				? 'variant-filled'
				: 'variant-ghost'
		} m-0.5`}
		on:click={() => {
			if ($data.selected_preset && $data.presets.indexOf($data.selected_preset) < $data.presets.length - 1) {
				// @ts-ignore
				$data.presets = $data.presets.filter((p) => p !== $data.selected_preset);
				$data.presets.push($data.selected_preset);
				localStorage.setItem('presets', JSON.stringify($data.presets));
			}
		}}
		><i class="fa-solid fa-angles-right" />
	</button>
</div>
<button class="btn variant-filled-success" on:click={data.sync_presets}>sync presets</button>
<div>
	<div class="mb-4">
		{#if $data.selected_preset}
			based on: {$data.selected_preset?.name}
		{:else}
			creating preset from scratch
		{/if}
	</div>
	<label for="fieldPresetName" style="font-weight: bold; display: inline;"> preset name: </label>
	<input id="fieldPresetName" type="text" bind:value={preset_name} />
	<br />
	<div>
		<span style="font-weight: bold">
			<abbr title={'eg: https://en.wiktionary.org/wiki/${front.skipFirstWord}#Dutch'}
				>preset iframes</abbr
			>
		</span>
		<button
			on:click={() => {
				is_iframe_list_visible = !is_iframe_list_visible;
			}}
			class="btn mt-2 mb-2 btn-sm btn-icon order-6 md:order-none {is_iframe_list_visible
				? 'variant-filled'
				: 'variant-ghost'}"
		>
			{#if is_iframe_list_visible}
				<i class="fa-solid fa-chevron-up" />
			{:else}
				<i class="fa-solid fa-chevron-down" />
			{/if}
		</button>
		{#if is_iframe_list_visible}
			<div class="w-full md:px-12">
				{#if !preset_iframes?.length}
					<div class="card p-2 mt-2 variant-ghost-error">no iframes defined yet</div>
				{/if}
				<div
					class="mt-2"
					style="display: grid; grid-template-columns: 1fr 2.574rem; row-gap: 0.286rem; column-gap: 0.5148rem;"
				>
					{#each preset_iframes || [] as iframe, position}
						<input
							id={`iframe_name_${position}`}
							placeholder="wiktionary"
							style="width:100%"
							type="text"
							bind:value={iframe[0]}
						/>
						<button
							type="button"
							class="btn btn-sm variant-filled-warning"
							style="font-weight: bold;"
							on:click={() => {
								preset_iframes?.splice(position, 1);
								preset_iframes = preset_iframes;
							}}
						>
							<i class="fa-solid fa-remove" />
						</button>
						<div class="col-span-full">
							<textarea
								placeholder={'https://en.m.wiktionary.org/wiki/${front.skipFirstWord}#Dutch'}
								style="width:100%;"
								class="text-black"
								bind:value={iframe[1]}
							/>
						</div>
					{/each}
					<!-- <button
						style="grid-column: 1; height: 2.574rem;"
						type="button"
						class="btn btn-sm variant-filled-success"
						on:click={() => {
							add_missing_bindings(field);
						}}
					>
						add missing
					</button> -->
					<button
						style="height: 2.574rem;"
						type="button"
						class="btn btn-sm variant-filled-success col-start-2"
						on:click={() => {
							preset_iframes = [...(preset_iframes || []), ['', '']];
						}}
					>
						<i class="fa-solid fa-plus" />
					</button>
				</div>
			</div>
		{/if}
	</div>

	<div
		style={`display: grid; grid-template-columns: 4.004rem repeat(25, 1fr); color: hsl(${selected_hue} 50% 50%)`}
		class="mt-2"
	>
		color:
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:click={() => {
				selected_hue = '';
			}}
			style={`background-color: white; width: 100%; height: 1.5444rem;`}
		/>
		{#each Array.from(new Array(24), (_, i) => i * 15) as hue}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				on:click={() => {
					selected_hue = hue.toString();
				}}
				style={`background-color: hsl(${hue} 50% 50%); width: 100%; height: 1.5444rem;`}
			/>
		{/each}
	</div>
	{#each $data.fields as field, i_field}
		<div
			class="card p-4 grid-cols-[12.2rem,2.574rem,2.574rem,4.3rem,2.574rem] md:grid-cols-[8.8rem,22.88rem,2.574rem,2.574rem,2.574rem,4.3rem,2.574rem]"
			style="display: grid; gap: 0.5148rem; margin-top: 0.572rem;"
		>
			<input type="text" style="grid-column: 1; margin-right: 0.286rem;" bind:value={field.name} />
			<button
				on:click={() => {
					field.visible_by_default = !field.visible_by_default;
				}}
				class="btn btn-sm order-1 {field.visible_by_default ? 'variant-filled' : 'variant-ghost'}"
			>
				{#if field.visible_by_default}
					<i class="fa-solid fa-eye" />
				{:else}
					<i class="fa-solid fa-eye-slash" />
				{/if}
			</button>
			<button
				on:click={() => {
					field.frozen_by_default = !field.frozen_by_default;
				}}
				class="btn btn-sm order-2 {!field.frozen_by_default ? 'variant-filled' : 'variant-ghost'}"
			>
				{#if field.frozen_by_default}
					<i class="fa-solid fa-lock" />
				{:else}
					<i class="fa-solid fa-lock-open" />
				{/if}
			</button>
			<div class="order-4" style="display: flex; direction: row;">
				<button
					style="border-top-right-radius: 0; border-bottom-right-radius: 0; margin-bottom: 0.286rem;"
					class="btn btn-sm {i_field == 0 ? 'variant-ghost-secondary' : 'variant-filled-secondary'}"
					disabled={i_field == 0}
					on:click={() => {
						let temp = $data.fields[i_field - 1];
						$data.fields[i_field - 1] = field;
						$data.fields[i_field] = temp;
					}}><i class="fa-solid fa-arrow-up" /></button
				>
				<button
					style="border-top-left-radius: 0; border-bottom-left-radius: 0; margin-top: 0.286rem;"
					class="btn btn-sm {i_field == $data.fields.length - 1
						? 'variant-ghost-secondary'
						: 'variant-filled-secondary'}"
					disabled={i_field == $data.fields.length - 1}
					on:click={() => {
						let temp = $data.fields[i_field + 1];
						$data.fields[i_field + 1] = field;
						$data.fields[i_field] = temp;
					}}><i class="fa-solid fa-arrow-down" /></button
				>
			</div>
			<button
				style="font-weight: bold;"
				class="btn btn-sm variant-filled-primary order-4"
				on:click={() => {
					$data.fields = $data.fields.filter((e) => e.id != field.id);
				}}
			>
				<i class="fa-solid fa-remove" /></button
			>
			<RadioGroup class="order-5 md:order-none col-span-4 md:col-span-1">
				<RadioItem
					bind:group={field.type}
					on:click={() => {
						field.default = [field.default[0] ?? ''];
					}}
					name="type"
					value="text">text</RadioItem
				>
				<RadioItem
					bind:group={field.type}
					on:click={() => {
						if (!field.options.includes(field.default[0])) {
							field.options = [...field.options, field.default[0] ?? ''];
						}
						field.default = [field.default[0] ?? ''];
					}}
					name="type"
					value="selectOne">single</RadioItem
				>
				<RadioItem
					bind:group={field.type}
					on:click={() => {
						console.log(field.options);
						field.options = field.options.filter((e) => e);
						if (field.default[0]?.length > 0 && !field.options.includes(field.default[0])) {
							field.options = [...field.options, field.default[0]];
						}
						field.default = field.default.filter((e) => e);
					}}
					name="type"
					value="selectMany">multiple</RadioItem
				>
				<RadioItem
					bind:group={field.type}
					on:click={() => {
						field.bindings = [
							['nl', 'Dutch'],
							['en', 'English']
						];
						field.binding_type = BindingType.EQUALS;
						if (($data.fields?.length ?? 0) >= 3 && field.id != 3) {
							field.bound_to = 3;
						} else {
							for (let i = 0; i < $data.fields.length; i++) {
								if ($data.fields[i].id != field.id) {
									field.bound_to = $data.fields[i].id;
									break;
								}
							}
						}
						// console.log(field.options);
						// field.options = field.options.filter((e) => e);
						// if (field.default[0]?.length > 0 && !field.options.includes(field.default[0])) {
						// 	field.options = [...field.options, field.default[0]];
						// }
						// field.default = field.default.filter((e) => e);
					}}
					name="type"
					value="bound">bound</RadioItem
				>
			</RadioGroup>
			<button
				on:click={() => {
					field.expanded_in_editor = !field.expanded_in_editor;
				}}
				class="btn btn-sm order-6 md:order-none {field.expanded_in_editor
					? 'variant-filled'
					: 'variant-ghost'}"
			>
				{#if field.expanded_in_editor}
					<i class="fa-solid fa-chevron-up" />
				{:else}
					<i class="fa-solid fa-chevron-down" />
				{/if}
			</button>
			{#if field.expanded_in_editor}
				{#if field.type === 'text'}
					<label class="order-7 col-start-1 md:col-start-2 col-end-5 md:col-end-3">
						default: <input
							class="mt-2"
							style="width: calc(100% - 7ch);"
							type="text"
							bind:value={field.default[0]}
						/>
					</label>
				{:else if field.type === 'selectOne'}
					<div class="order-7 col-start-1 md:col-start-2 col-end-5 md:col-end-4">
						<!-- <div>
							options: {field.options.join(', ')}
						</div>
						<div style="margin-bottom: 0.572rem;">
							default: {field.default[0]}
						</div> -->
						<ListBox>
							<div
								class="mt-2"
								style="display: grid; grid-template-columns: 1fr 2.574rem; row-gap: 0.286rem; column-gap: 0.5148rem;"
							>
								{#each field.options as option, i_option}
									<ListBoxItem bind:group={field.default[0]} name="option" value={option}
										>{option || '(empty)'}</ListBoxItem
									>
									<button
										type="button"
										class="btn btn-sm variant-filled-warning"
										style="font-weight: bold;"
										on:click={() => {
											field.options.splice(i_option, 1);
											field.options = field.options;
											if (field.default[0] == option) {
												field.default = [];
											}
										}}
									>
										<i class="fa-solid fa-remove" />
									</button>
								{/each}
								<input type="text" bind:value={field.current_inputs[0]} />
								<button
									type="button"
									class="btn btn-sm variant-filled-success"
									on:click={() => {
										if (field.options.includes(field.current_inputs[0])) {
											showErrorToast($data.toastStore, 'Value already exists!');
											return;
										}
										field.options.push(field.current_inputs[0] || '');
										field.current_inputs = [''];
									}}
								>
									<i class="fa-solid fa-plus" />
								</button>
							</div>
						</ListBox>
					</div>
				{:else if field.type === 'selectMany'}
					<div class="order-7 col-start-1 md:col-start-2 col-end-5 md:col-end-4">
						<!-- <div>
							options: {field.options.join(', ')}
						</div>
						<div style="margin-bottom: 0.572rem;">
							default: {field.default.join(', ')}
						</div> -->
						<ListBox multiple>
							<div
								class="mt-2"
								style="display: grid; grid-template-columns: 1fr 2.574rem; row-gap: 0.286rem; column-gap: 0.5148rem;"
							>
								{#each field.options as option, i_option}
									<ListBoxItem bind:group={field.default} name="option" value={option}
										>{option || '(empty)'}</ListBoxItem
									>
									<button
										type="button"
										class="btn btn-sm variant-filled-warning"
										style="font-weight: bold;"
										on:click={() => {
											field.options.splice(i_option, 1);
											field.options = field.options;
											if (field.default.includes(option)) {
												field.default = field.default.filter((e) => e != option);
											}
										}}
									>
										<i class="fa-solid fa-remove" />
									</button>
								{/each}
								<input type="text" bind:value={field.current_inputs[0]} />
								<button
									type="button"
									class="btn btn-sm variant-filled-success"
									on:click={() => {
										if (!field.current_inputs[0]?.length) {
											showErrorToast($data.toastStore, "Value of 'select many' must not be empty!");
											return;
										}
										if (field.options.includes(field.current_inputs[0])) {
											showErrorToast($data.toastStore, 'Value already exists!');
											return;
										}
										field.options.push(field.current_inputs[0] || '');
										field.current_inputs = [''];
									}}
								>
									<i class="fa-solid fa-plus" />
								</button>
							</div>
						</ListBox>
					</div>
				{:else if field.type === 'bound'}
					<label class="order-7 col-start-1 md:col-start-2 col-end-5 md:col-end-2">
						default: <input
							class="mt-2"
							style="width: calc(100% - 3.85rem);"
							type="text"
							bind:value={field.default[0]}
						/>
					</label>
					<div class="order-7 col-start-1 md:col-start-2 col-end-5 md:col-end-2">
						bound to:
						<div class="card p-2 pr-2">
							{#each $data.fields.filter((e) => e != field) as field_to_bind}
								<button
									class={`btn ${
										field_to_bind.id == field?.bound_to ? 'variant-filled' : 'variant-ghost'
									} m-0.5`}
									on:click={() => {
										field.bound_to = field_to_bind.id;
									}}
								>
									{field_to_bind.name}
								</button>
							{/each}
						</div>
						<RadioGroup>
							{#each Object.values(BindingType) as binding_type}
								<RadioItem bind:group={field.binding_type} name="binding_type" value={binding_type}
									>{binding_type}</RadioItem
								>
							{/each}
						</RadioGroup>
					</div>
					<div class="order-7 col-start-1 md:col-start-2 col-end-6 md:col-end-5">
						<div
							class="mt-2"
							style="display: grid; grid-template-columns: 1fr 3ch 1fr 2.574rem; row-gap: 0.286rem; column-gap: 0.5148rem;"
						>
							{#each field.bindings || [] as binding, i_binding}
								<div>
									<input style="width:100%" type="text" bind:value={binding[0]} />
								</div>
								<div>
									{'->'}
								</div>
								<div>
									<input style="width:100%" type="text" bind:value={binding[1]} />
								</div>
								<button
									type="button"
									class="btn btn-sm variant-filled-warning"
									style="font-weight: bold;"
									on:click={() => {
										field?.bindings?.splice(i_binding, 1);
										field.bindings = field.bindings;
									}}
								>
									<i class="fa-solid fa-remove" />
								</button>
							{/each}
							<button
								style="grid-column: 1; height: 2.574rem;"
								type="button"
								class="btn btn-sm variant-filled-success"
								on:click={() => {
									add_missing_bindings(field);
								}}
							>
								add missing
							</button>
							<button
								style="grid-column: 4; height: 2.574rem;"
								type="button"
								class="btn btn-sm variant-filled-success"
								on:click={() => {
									field.bindings = [...(field.bindings || []), ['', '']];
								}}
							>
								<i class="fa-solid fa-plus" />
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/each}

	<div
		class="card p-4 grid-cols-[12.2rem,2.574rem,2.574rem,4.3rem,2.574rem] md:grid-cols-[8.8rem,22.88rem,2.574rem,2.574rem,2.574rem,4.3rem,2.574rem]"
		style="display: grid; gap: 0.572rem; padding-right: 0px; margin-top: 0.858rem;"
	>
		<input
			type="text"
			style="grid-column: 1; margin-right: 0.286rem;"
			bind:value={new_field_name}
		/>
		<RadioGroup class="hidden md:inline-flex">
			<RadioItem bind:group={new_field_type} name="type" value="text">text</RadioItem>
			<RadioItem bind:group={new_field_type} name="type" value="selectOne">single</RadioItem>
			<RadioItem bind:group={new_field_type} name="type" value="selectMany">multiple</RadioItem>
			<RadioItem bind:group={new_field_type} name="type" value="bound">bound</RadioItem>
		</RadioGroup>
		<button
			class="btn btn-sm variant-filled-success col-start-2 md:col-start-3 col-end-7 md:col-end-8 md:mr-1 mr-4"
			on:click={() => {
				create_field();
			}}>add field</button
		>
	</div>
	{#if $data.selected_preset}
		<button
			style="margin-top: 0.858rem;"
			class="btn btn-large variant-filled-warning"
			on:click={update_preset}>update {$data.selected_preset.name}</button
		>
		<button
			style="margin-top: 0.858rem;"
			class="btn btn-large variant-filled-success"
			on:click={save_preset_as_new}>save as new</button
		>
	{:else}
		<button
			style="margin-top: 0.858rem;"
			class="btn btn-large variant-filled-success"
			on:click={save_preset_as_new}>save preset</button
		>
	{/if}
</div>

<style lang="postcss">
	input {
		color: black;
	}
</style>
