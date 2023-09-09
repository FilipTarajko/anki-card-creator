<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data } from '../store';

	let last_id = 2;
	let preset_name = '';

	let new_field_name = '';
	let new_field_type: 'text' | 'selectOne' | 'selectMany' | null = null;

	function create_field() {
		last_id++;
		fields = [
			...fields,
			{
				id: last_id,
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

	let fields: Field[] = [
		{
			id: 0,
			name: 'field1',
			type: 'text',
			options: [],
			default: [],
			visible_by_default: true,
			current_inputs: []
		},
		{
			id: 1,
			name: 'field2',
			type: 'selectOne',
			options: ['cat', 'dog', 'bird'],
			default: ['cat'],
			visible_by_default: true,
			current_inputs: []
		},
		{
			id: 2,
			name: 'field3',
			type: 'selectMany',
			options: ['cat', 'dog', 'bird'],
			default: ['cat', 'dog'],
			visible_by_default: true,
			current_inputs: []
		}
	];
</script>

<div>
	<span style="font-weight: bold"> preset name: </span>
	<input type="text" bind:value={preset_name} />
	{#each fields as field, i_field}
		<div
			class="card p-4"
			style="display: grid; grid-template-columns: 15ch 5fr 4.5ch 4.5ch 7ch 4.5ch; gap: 8px; margin-top: 12px;"
		>
			<input type="text" style="grid-column: 1; margin-right: 4px;" bind:value={field.name} />
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
					style="border-top-right-radius: 0; border-bottom-right-radius: 0; margin-bottom: 4px;"
					class="btn btn-sm {i_field == 0 ? 'variant-ghost-secondary' : 'variant-filled-secondary'}"
					disabled={i_field == 0}
					on:click={() => {
						let temp = fields[i_field - 1];
						fields[i_field - 1] = field;
						fields[i_field] = temp;
					}}><i class="fa-solid fa-arrow-up" /></button
				>
				<button
					style="border-top-left-radius: 0; border-bottom-left-radius: 0; margin-top: 4px;"
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
				}}>X</button
			>
			{#if field.currently_visible}
				{#if field.type === 'text'}
					<div style="grid-column: 2">
						default: <input style="width: 240px;" type="text" bind:value={field.default[0]} />
					</div>
				{:else if field.type === 'selectOne'}
					<div style="grid-column: 2">
						<div>
							options: {field.options.join(', ')}
						</div>
						<div style="margin-bottom: 8px;">
							default: {field.default[0]}
						</div>
						<ListBox>
							<div style="display: grid; grid-template-columns: 1fr 4.5ch; gap: 2px;">
								{#each field.options as option, i_option}
									<ListBoxItem bind:group={field.default[0]} name="option" value={option}
										>{option || '(empty)'}</ListBoxItem
									>
									<button
										type="button"
										class="btn-icon variant-filled-warning"
										style="font-weight: bold;"
										on:click={() => {
											field.options.splice(i_option, 1);
											field.options = field.options;
										}}
									>
										X
									</button>
								{/each}
								<input type="text" bind:value={field.current_inputs[0]} />
								<button
									type="button"
									class="btn-icon variant-filled-success"
									style="font-size: 1.6rem;"
									on:click={() => {
										field.options.push(field.current_inputs[0] || '');
										field.current_inputs = [''];
									}}
								>
									+
								</button>
							</div>
						</ListBox>
					</div>
				{:else if field.type === 'selectMany'}
					<div style="grid-column: 2">
						<div>
							options: {field.options.join(', ')}
						</div>
						<div style="margin-bottom: 8px;">
							default: {field.default.join(', ')}
						</div>
						<ListBox multiple>
							<div style="display: grid; grid-template-columns: 1fr 4.5ch; gap: 2px;">
								{#each field.options as option, i_option}
									<ListBoxItem bind:group={field.default} name="option" value={option}
										>{option || '(empty)'}</ListBoxItem
									>
									<button
										type="button"
										class="btn-icon variant-filled-warning"
										style="font-weight: bold;"
										on:click={() => {
											field.options.splice(i_option, 1);
											field.options = field.options;
										}}
									>
										X
									</button>
								{/each}
								<input type="text" bind:value={field.current_inputs[0]} />
								<button
									type="button"
									class="btn-icon variant-filled-success"
									style="font-size: 1.6rem;"
									on:click={() => {
										field.options.push(field.current_inputs[0] || '');
										field.current_inputs = [''];
									}}
								>
									+
								</button>
							</div>
						</ListBox>
					</div>
				{/if}
			{/if}
		</div>
	{/each}

	<div
		class="card p-4"
		style="display: grid; grid-template-columns: 15ch 5fr 4.5ch 4.5ch 7ch 4.5ch; gap: 8px; margin-top: 12px;"
	>
		<input type="text" style="grid-column: 1; margin-right: 4px;" bind:value={new_field_name} />
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
	<button
		style="margin-top: 12px;"
		class="btn btn-large variant-filled-success"
		on:click={() => {
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
					field.current_inputs = JSON.parse(JSON.stringify(field.default));
					field.currently_visible = JSON.parse(JSON.stringify(field.visible_by_default));
				});

				$data.presets = [
					...$data.presets,
					{
						name: preset_name,
						fields: JSON.parse(JSON.stringify(fields))
					}
				];
				localStorage.setItem('presets', JSON.stringify($data.presets));
			}
		}}>save preset</button
	>
</div>

<style lang="postcss">
	input {
		color: black;
	}
</style>
