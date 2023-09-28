<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data } from '../store';

	let preset_name = 'new preset';
	let selected_hue: string = '';
	let new_field_name = '';
	let new_field_type: 'text' | 'selectOne' | 'selectMany' | null = null;
	let based_on_preset: Preset | null = null;
	let default_fields = [
		{
			id: 0,
			name: 'deck',
			type: 'text',
			options: [],
			default: [],
			visible_by_default: true,
			current_inputs: []
		},
		{
			id: 1,
			name: 'notetype',
			type: 'selectOne',
			options: ['2X22', '3X22'],
			default: ['2X22'],
			visible_by_default: true,
			current_inputs: []
		},
		{
			id: 2,
			name: 'tags',
			type: 'selectMany',
			options: ['AnkiCC', 'test', 'test::AnkiCC', 'test::foo::baz::baz'],
			default: ['AnkiCC', 'test'],
			visible_by_default: true,
			current_inputs: []
		}
	];
	let fields: Field[] = JSON.parse(JSON.stringify(default_fields));

	function create_field() {
		fields = [
			...fields,
			{
				id: fields.length,
				name: new_field_name,
				type: new_field_type ?? 'text',
				options: [],
				default: [],
				visible_by_default: true,
				current_inputs: []
			}
		];
		new_field_name = '';
		new_field_type = null;
	}

	function save_preset_as_new() {
		if (!preset_name) {
			// TODO: handle it better
			alert("Please enter preset's name");
		} else if (
			// @ts-ignore
			$data.presets.find((e) => e.name.toLowerCase().trim() === preset_name.toLowerCase().trim())
		) {
			// TODO: handle it better
			alert('Preset with this name already exists!');
		} else {
			fields.forEach((field) => {
				if (field.type !== 'selectMany') {
					field.current_inputs = [JSON.parse(JSON.stringify(field.default[0] || ''))];
				} else {
					field.current_inputs = JSON.parse(JSON.stringify(field.default));
				}
				field.currently_visible = JSON.parse(JSON.stringify(field.visible_by_default));
			});

			$data.presets = [
				...$data.presets,
				{
					name: preset_name,
					fields: JSON.parse(JSON.stringify(fields)),
					last_edited: new Date().getTime(),
					status: 'unsynced',
					hue: selected_hue
				}
			];
			localStorage.setItem('presets', JSON.stringify($data.presets));
		}
	}

	function update_preset() {
		if (!based_on_preset) {
			console.error('based_on_preset is null');
		} else if (!preset_name) {
			// TODO: handle it better
			alert("Please enter preset's name");
		} else if (
			// @ts-ignore
			$data.presets.find(
				(e: Preset) =>
					e.name.toLowerCase().trim() === preset_name.toLowerCase().trim() && e !== based_on_preset
			)
		) {
			// TODO: handle it better
			alert('Preset with this name already exists!');
		} else {
			fields.forEach((field) => {
				if (field.type !== 'selectMany') {
					field.current_inputs = [JSON.parse(JSON.stringify(field.default[0] || ''))];
				} else {
					field.current_inputs = JSON.parse(JSON.stringify(field.default));
				}
				field.currently_visible = JSON.parse(JSON.stringify(field.visible_by_default));
			});

			based_on_preset.fields = fields;
			based_on_preset.name = preset_name;
			based_on_preset.last_edited = new Date().getTime();
			based_on_preset.hue = selected_hue;

			if (based_on_preset.status == 'synced') {
				based_on_preset.status = 'to_update';
			}
			$data.presets = $data.presets;
			localStorage.setItem('presets', JSON.stringify($data.presets));
		}
	}
</script>

<h2 class="h2 mt-12">Create a card preset</h2>
<div class="card p-2 ml-6 mr-6">
	{#each $data.presets as preset}
		<button
			style={`color: hsl(${preset.hue} ${
				based_on_preset?.name == preset.name
					? '100% 20%); background-color: hsl(' + preset.hue + ' 100% 87%);'
					: '70% 50%);'
			}`}
			class={`btn ${
				based_on_preset?.name == preset.name ? 'variant-filled' : 'variant-ghost'
			} m-0.5`}
			on:click={() => {
				preset_name = preset.name;
				fields = JSON.parse(JSON.stringify(preset.fields));
				based_on_preset = preset;
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
		class={`btn ${!based_on_preset ? 'variant-filled' : 'variant-ghost'} m-0.5`}
		on:click={() => {
			preset_name = 'new preset';
			fields = JSON.parse(JSON.stringify(default_fields));
			based_on_preset = null;
		}}
	>
		<b><i>new preset</i></b>
	</button>
</div>
<div>
	<div class="mb-4">
		{#if based_on_preset}
			based on: {based_on_preset.name}
		{:else}
			creating preset from scratch
		{/if}
	</div>
	<span style="font-weight: bold"> preset name: </span>
	<input type="text" bind:value={preset_name} />

	<div
		style={`display: grid; grid-template-columns: 4.004rem repeat(16, 1fr); color: hsl(${selected_hue} 50% 50%)`}
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
		{#each Array.from(new Array(15), (_, i) => i * 24) as hue}
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
	{#each fields as field, i_field}
		<div
			class="card p-4"
			style="display: grid; grid-template-columns: 10.582rem 22.88rem 2.574rem 2.574rem 1fr 2.574rem; gap: 0.5148rem; margin-top: 0.572rem;"
		>
			<input type="text" style="grid-column: 1; margin-right: 0.286rem;" bind:value={field.name} />
			<RadioGroup>
				<RadioItem bind:group={field.type} name="type" value="text">text</RadioItem>
				<RadioItem bind:group={field.type} name="type" value="selectOne">select one</RadioItem>
				<RadioItem bind:group={field.type} name="type" value="selectMany">select many</RadioItem>
			</RadioGroup>
			<button
				on:click={() => {
					field.currently_visible = !field.currently_visible;
				}}
				class="btn btn-sm {field.currently_visible ? 'variant-filled' : 'variant-ghost'}"
			>
				{#if field.currently_visible}
					<i class="fa-solid fa-chevron-up" />
				{:else}
					<i class="fa-solid fa-chevron-down" />
				{/if}
			</button>
			<button
				on:click={() => {
					field.visible_by_default = !field.visible_by_default;
				}}
				class="btn btn-sm {field.visible_by_default ? 'variant-filled' : 'variant-ghost'}"
			>
				{#if field.visible_by_default}
					<i class="fa-solid fa-eye" />
				{:else}
					<i class="fa-solid fa-eye-slash" />
				{/if}
			</button>
			<div style="display: flex; direction: row;">
				<button
					style="border-top-right-radius: 0; border-bottom-right-radius: 0; margin-bottom: 0.286rem;"
					class="btn btn-sm {i_field == 0 ? 'variant-ghost-secondary' : 'variant-filled-secondary'}"
					disabled={i_field == 0}
					on:click={() => {
						let temp = fields[i_field - 1];
						fields[i_field - 1] = field;
						fields[i_field] = temp;
					}}><i class="fa-solid fa-arrow-up" /></button
				>
				<button
					style="border-top-left-radius: 0; border-bottom-left-radius: 0; margin-top: 0.286rem;"
					class="btn btn-sm {i_field == fields.length - 1
						? 'variant-ghost-secondary'
						: 'variant-filled-secondary'}"
					disabled={i_field == fields.length - 1}
					on:click={() => {
						let temp = fields[i_field + 1];
						fields[i_field + 1] = field;
						fields[i_field] = temp;
					}}><i class="fa-solid fa-arrow-down" /></button
				>
			</div>
			<button
				style="font-weight: bold;"
				class="btn btn-sm variant-filled-primary"
				on:click={() => {
					fields = fields.filter((e) => e.id != field.id);
				}}
			>
				<i class="fa-solid fa-remove" /></button
			>
			{#if field.currently_visible}
				<div style="grid-column-start: 2; grid-column-end: 4;">
					{#if field.type === 'text'}
						default: <input style="width: 14.3rem;" type="text" bind:value={field.default[0]} />
					{:else if field.type === 'selectOne'}
						<div>
							options: {field.options.join(', ')}
						</div>
						<div style="margin-bottom: 0.572rem;">
							default: {field.default[0]}
						</div>
						<ListBox>
							<div
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
											alert('Value already added!');
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
					{:else if field.type === 'selectMany'}
						<div>
							options: {field.options.join(', ')}
						</div>
						<div style="margin-bottom: 0.572rem;">
							default: {field.default.join(', ')}
						</div>
						<ListBox multiple>
							<div
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
											alert('Value already added!');
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
					{/if}
				</div>
			{/if}
		</div>
	{/each}

	<div
		class="card p-4"
		style="display: grid; grid-template-columns: 10.582rem 22.88rem 2.574rem 2.574rem 4.004rem 2.574rem; gap: 0.572rem; margin-top: 0.858rem;"
	>
		<input
			type="text"
			style="grid-column: 1; margin-right: 0.286rem;"
			bind:value={new_field_name}
		/>
		<RadioGroup>
			<RadioItem bind:group={new_field_type} name="type" value="text">text</RadioItem>
			<RadioItem bind:group={new_field_type} name="type" value="selectOne">select one</RadioItem>
			<RadioItem bind:group={new_field_type} name="type" value="selectMany">select many</RadioItem>
		</RadioGroup>
		<button
			style="grid-column: 3/7;"
			class="btn btn-sm variant-filled-success"
			on:click={() => {
				create_field();
			}}>add field</button
		>
	</div>
	{#if based_on_preset}
		<button
			style="margin-top: 0.858rem;"
			class="btn btn-large variant-filled-warning"
			on:click={update_preset}>update {based_on_preset.name}</button
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
