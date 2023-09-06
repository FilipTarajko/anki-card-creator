<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

	let last_id = 2;
	let preset_name = '';

	type Field = {
		id: number;
		name: string;
		type: 'text' | 'selectOne' | 'selectMany';
		options: string[];
		default: string[];
		option_input?: string;
		visible_by_default: boolean;
	};

	function create_field() {
		last_id++;
		fields = [
			...fields,
			{
				id: last_id,
				name: '',
				type: 'text',
				options: [''],
				default: [''],
				visible_by_default: true
			}
		];
	}

	let fields: Field[] = [
		{
			id: 0,
			name: 'field1',
			type: 'text',
			options: [''],
			default: [''],
			visible_by_default: true
		},
		{
			id: 1,
			name: 'field2',
			type: 'selectOne',
			options: ['cat', 'dog', 'bird'],
			default: ['cat'],
			visible_by_default: true
		},
		{
			id: 2,
			name: 'field3',
			type: 'selectMany',
			options: ['cat', 'dog', 'bird'],
			default: ['cat', 'dog'],
			visible_by_default: true
		}
	];
</script>

<div>
	<span style="font-weight: bold"> preset name: </span>
	<input type="text" bind:value={preset_name} />
	<div
		style="display: grid; grid-template-columns: 15ch 5fr 7ch 4.5ch; gap: 8px; margin-top: 20px;"
	>
		{#each fields as field, i_field}
			<input type="text" style="grid-column: 1; margin-right: 4px;" bind:value={field.name} />
			<RadioGroup>
				<RadioItem bind:group={field.type} name="type" value="text">text</RadioItem>
				<RadioItem bind:group={field.type} name="type" value="selectOne">select one</RadioItem>
				<RadioItem bind:group={field.type} name="type" value="selectMany">select many</RadioItem>
			</RadioGroup>
			<div style="display: flex; direction: row;">
				<button
					style="border-top-right-radius: 0; border-bottom-right-radius: 0; margin-bottom: 4px;"
					class="btn btn-sm {i_field == 0 ? 'variant-ghost-secondary' : 'variant-filled-secondary'}"
					disabled={i_field == 0}
					on:click={() => {
						let temp = fields[i_field - 1];
						fields[i_field - 1] = field;
						fields[i_field] = temp;
					}}>↑</button
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
					}}>↓</button
				>
			</div>
			<button
				class="btn btn-sm variant-filled-primary"
				on:click={() => {
					fields = fields.filter((e) => e.id != field.id);
				}}>X</button
			>
			{#if field.type === 'text'}
				<div style="grid-column: 2">
					default: <input type="text" bind:value={field.default[0]} />
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
						<div style="display: grid; grid-template-columns: 1fr 8ch; gap: 2px;">
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
							<input type="text" bind:value={field.option_input} />
							<button
								type="button"
								class="btn-icon variant-filled-success"
								style="font-size: 1.6rem;"
								on:click={() => {
									field.options.push(field.option_input || '');
									field.option_input = '';
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
						<div style="display: grid; grid-template-columns: 1fr 8ch; gap: 2px;">
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
							<input type="text" bind:value={field.option_input} />
							<button
								type="button"
								class="btn-icon variant-filled-success"
								style="font-size: 1.6rem;"
								on:click={() => {
									field.options.push(field.option_input || '');
									field.option_input = '';
								}}
							>
								+
							</button>
						</div>
					</ListBox>
				</div>
			{/if}
		{/each}
		<button
			style="grid-column: 1;"
			class="btn btn-sm variant-filled-success"
			on:click={() => {
				create_field();
			}}>add another field</button
		>
	</div>
	<button
		class="btn btn-large variant-filled-success"
		on:click={() => {
			create_field();
		}}>save preset</button
	>
</div>

<style scoped>
	input {
		color: black;
	}
</style>
