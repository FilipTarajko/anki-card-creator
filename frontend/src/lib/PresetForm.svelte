<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

	let last_id = 2;

	type Field = {
		id: number;
		name: string;
		type: 'text' | 'selectOne' | 'selectMany';
		options: string[];
		default: string[];
		option_input?: string;
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
				default: ['']
			}
		];
	}

	let fields: Field[] = [
		{
			id: 0,
			name: 'field1',
			type: 'text',
			options: [''],
			default: ['']
		},
		{
			id: 1,
			name: 'field2',
			type: 'selectOne',
			options: ['cat', 'dog', 'bird'],
			default: ['cat']
		},
		{
			id: 2,
			name: 'field3',
			type: 'selectMany',
			options: ['cat', 'dog', 'bird'],
			default: ['cat', 'dog']
		}
	];
</script>

<div style="display: grid; grid-template-columns: 7ch 7ch 7ch 15ch 5fr; gap: 8px;">
	{#each fields as field, i_field}
		<button
			class="btn btn-sm variant-ghost-surface"
			on:click={() => {
				fields = fields.filter((e) => e.id != field.id);
			}}>delete</button
		>
		<button
			class="btn btn-sm variant-ghost-surface"
			disabled={i_field == 0}
			on:click={() => {
				let temp = fields[i_field - 1];
				fields[i_field - 1] = field;
				fields[i_field] = temp;
			}}>up</button
		>
		<button
			class="btn btn-sm variant-ghost-surface"
			disabled={i_field == fields.length - 1}
			on:click={() => {
				let temp = fields[i_field + 1];
				fields[i_field + 1] = field;
				fields[i_field] = temp;
			}}>down</button
		>
		<input type="text" bind:value={field.name} />
		<RadioGroup>
			<RadioItem bind:group={field.type} name="type" value="text">text</RadioItem>
			<RadioItem bind:group={field.type} name="type" value="selectOne">select one</RadioItem>
			<RadioItem bind:group={field.type} name="type" value="selectMany">select many</RadioItem>
		</RadioGroup>
		{#if field.type === 'text'}
			<div style="grid-column: 5">
				default: <input type="text" bind:value={field.default[0]} />
			</div>
		{:else if field.type === 'selectOne'}
			<div style="grid-column: 5">
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
								<!-- <i class="fa-solid fa-skull" /> -->
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
			<div style="grid-column: 5">
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
								<!-- <i class="fa-solid fa-skull" /> -->
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
		style="grid-column: 1 / 4;"
		class="btn btn-sm variant-ghost-surface"
		on:click={() => {
			create_field();
		}}>new</button
	>
</div>

<style scoped>
	input {
		color: black;
	}
</style>
