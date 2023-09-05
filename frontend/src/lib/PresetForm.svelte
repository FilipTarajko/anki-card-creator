<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

	type Field = {
		name: string;
		type: 'text' | 'selectOne' | 'selectMany';
		options: string[];
		default_one: string;
		default_many: string[];
		option_input?: string;
	};

	let fields: Field[] = [
		{
			name: '',
			type: 'text',
			options: [''],
			default_one: '',
			default_many: []
		},
		{
			name: '',
			type: 'selectOne',
			options: ['cat', 'dog', 'bird'],
			default_one: 'cat',
			default_many: []
		},
		{
			name: '',
			type: 'selectMany',
			options: ['cat', 'dog', 'bird'],
			default_many: ['cat', 'dog'],
			default_one: ''
		}
	];
</script>

<div style="display: grid; grid-template-columns: 7ch 7ch 7ch 15ch 5fr; gap: 8px;">
	{#each fields as field}
		<button class="btn btn-sm variant-ghost-surface">delete</button>
		<button class="btn btn-sm variant-ghost-surface">up</button>
		<button class="btn btn-sm variant-ghost-surface">down</button>
		<input type="text" bind:value={field.name} />
		<RadioGroup>
			<RadioItem bind:group={field.type} name="type" value="text">text</RadioItem>
			<RadioItem bind:group={field.type} name="type" value="selectOne">select one</RadioItem>
			<RadioItem bind:group={field.type} name="type" value="selectMany">select many</RadioItem>
		</RadioGroup>
		{#if field.type === 'text'}
			<div style="grid-column: 5">
				default: <input type="text" bind:value={field.default_one} />
			</div>
		{:else if field.type === 'selectOne'}
			<div style="grid-column: 5">
				<div>
					options: {field.options.join(', ')}
				</div>
				<div style="margin-bottom: 8px;">
					default: {field.default_one}
				</div>
				<ListBox>
					<div style="display: grid; grid-template-columns: 1fr 8ch; gap: 2px;">
						{#each field.options as option}
							<ListBoxItem bind:group={field.default_one} name="option" value={option}
								>{option}</ListBoxItem
							>
							<button
								type="button"
								class="btn-icon variant-filled-warning"
								style="font-weight: bold;"
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
								if (field.option_input) {
									field.options.push(field.option_input);
									field.option_input = '';
								}
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
					default: {field.default_many.join(', ')}
				</div>
				<ListBox multiple>
					<div style="display: grid; grid-template-columns: 1fr 8ch; gap: 2px;">
						{#each field.options as option}
							<ListBoxItem bind:group={field.default_many} name="option" value={option}
								>{option}</ListBoxItem
							>
							<button
								type="button"
								class="btn-icon variant-filled-warning"
								style="font-weight: bold;"
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
								if (field.option_input) {
									field.options.push(field.option_input);
									field.option_input = '';
								}
							}}
						>
							+
						</button>
					</div>
				</ListBox>
			</div>
		{/if}
	{/each}
	<button style="grid-column: 1 / 4;" class="btn btn-sm variant-ghost-surface">new</button>
</div>

<style scoped>
	input {
		color: black;
	}
</style>
