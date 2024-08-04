<script lang="ts">
	import { ListBox, ListBoxItem, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { data, transformTextForDuplicateCheck, appendToDuplicateCheckingValuesUnsynced, showSuccessToast, showErrorToast } from '../store';
	import { BindingType, NoteAddingMode, type Field, type Preset } from '../types';
	import IframesComponent from './IframesComponent.svelte';
	import axios from 'axios';

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
	$: did_current_preset_change = $data.current_preset_for_notes && !$data.presets.some((preset: Preset) => preset.last_edited === $data.current_preset_for_notes?.last_edited);

	$: {
		if ($data.current_preset_for_notes) {
			let output = '';
			$data.current_preset_for_notes.fields.forEach((field: Field) => {
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
		if (!field.bindings || !$data.current_preset_for_notes?.fields) {
			field.current_inputs = [structuredClone(field.default)[0]];
			return field.default[0];
		}

		let binding_value = null;
		for (let i = 0; i < $data.current_preset_for_notes?.fields?.length; i++) {
			if (field.bound_to == $data.current_preset_for_notes?.fields[i].id) {
				binding_value = $data.current_preset_for_notes?.fields[i].current_inputs[0];
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
		if (!$data.current_preset_for_notes || !iframe_source_template) {
			return '';
		}
		let str = iframe_source_template;
		for (let i = 0; i < $data.current_preset_for_notes.fields.length; i++) {
			const field = $data.current_preset_for_notes.fields[i];
			while (str.match(`\\$\{${field.name}[^\}]*\}`)) {
				const match = str.match(`\\$\{${field.name}[^\}]*\}`);
				let toReplaceWith = '';

				if (field.type == 'bound') {
					toReplaceWith = calculate_result_of_bound_field(field);
				} else {
					toReplaceWith = field.current_inputs.join(' ');
				}

				if (match![0].includes('.skipFirstWord')) {
					toReplaceWith = toReplaceWith.replace(/^[^\s]*\s/, '');
				}

				str = str.replace(new RegExp(`\\$\{${field.name}[^\}]*\}`), toReplaceWith);
			}
		}
		debounce(()=>{debounced_iframe_src = str})
		return str;
	};

	let debounced_iframe_src = ""

	let iframe_source_template = '';

	function selectPreset(preset: Preset) {
		$data.current_preset_for_notes = JSON.parse(JSON.stringify(preset));
		if ($data.current_preset_for_notes) {
			for (let i = 0; i < $data.current_preset_for_notes.fields.length; i++) {
				$data.current_preset_for_notes.fields[i].current_inputs = JSON.parse(
					JSON.stringify($data.current_preset_for_notes?.fields[i].default)
				);
				$data.current_preset_for_notes.fields[i].currently_frozen = $data.current_preset_for_notes.fields[i].frozen_by_default;
				$data.current_preset_for_notes.fields[i].currently_visible = $data.current_preset_for_notes.fields[i].visible_by_default;
			}
		}
		localStorage.setItem('current_preset_for_notes', JSON.stringify($data.current_preset_for_notes));
		iframe_source_template = $data.current_preset_for_notes?.iframes?.length && $data.current_preset_for_notes.iframes[0][1] || '';
	}

	function rememberCurrentPreset() {
		localStorage.setItem('current_preset_for_notes', JSON.stringify($data.current_preset_for_notes));
	}

	function rememberCurrentlyWrittenPrompt() {
		localStorage.setItem('currentlyWrittenPrompt', $data.currentlyWrittenPrompt || '')
	}

	function rememberCurrentlyWrittenPromptList() {
		localStorage.setItem('currentlyWrittenPromptList', $data.currentlyWrittenPromptList || '')
	}

	function rememberCurrentPromptListSeparator() {
		localStorage.setItem('currentPromptListSeparator', $data.currentPromptListSeparator || '')
	}

	function addOnePrompt() {
		addPrompt($data.currentlyWrittenPrompt || '');
		$data.currentlyWrittenPrompt = '';
		rememberCurrentlyWrittenPrompt();
	}

	function addPrompt(prompt: string) {
		if (!prompt) {
			showErrorToast($data.toastStore, 'Cannot add empty prompt!');
			return;
		} else if ($data.prompts_unsynced.includes(prompt)) {
			showErrorToast($data.toastStore, 'Prompt already exists!');
			return;
		}
		showSuccessToast($data.toastStore, 'Prompt added!');
		$data.prompts_unsynced.push(prompt);
		rememberPromptsUnsynced();
	}

	function addPromptsFromList() {
		const promptList = ($data.currentlyWrittenPromptList || '').split($data.currentPromptListSeparator || ' ');
		for (let i=0; i<promptList.length; i++) {
			addPrompt(promptList[i]);
		}
		$data.currentlyWrittenPromptList = '';
		localStorage.setItem('currentlyWrittenPromptList', '');
	}

	function rememberPromptsSynced() {
		localStorage.setItem('prompts_synced', JSON.stringify($data.prompts_synced));
	}

	function rememberPromptsDeleted() {
		localStorage.setItem('prompts_deleted', JSON.stringify($data.prompts_deleted));
	}

	function rememberPromptsUnsynced() {
		localStorage.setItem('prompts_unsynced', JSON.stringify($data.prompts_unsynced));
	}

	function rememberShouldKeepPrompt() {
		localStorage.setItem('shouldKeepPrompt', $data.shouldKeepPrompt);
	}

	function addNote() {
		showSuccessToast($data.toastStore, 'Note added!');
		$data.notes_unsynced +=
			current_output +
			`
`;
		const values_to_append = [];
		for (let i = 0; i < current_output.split(';').length; i++) {
			if (preset_fields_for_duplicate_checking.includes(i)) {
				values_to_append.push(current_output.split(';')[i]);
			}
		}
		appendToDuplicateCheckingValuesUnsynced($data, values_to_append);
		if ($data.current_preset_for_notes?.fields?.length) {
			for (let i = 0; i < $data.current_preset_for_notes?.fields?.length || 0; i++) {
				if (!$data.current_preset_for_notes?.fields[i].currently_frozen) {
					$data.current_preset_for_notes.fields[i].current_inputs = JSON.parse(
						JSON.stringify($data.current_preset_for_notes?.fields[i].default)
					);
				}
			}
		}
		localStorage.setItem('notes_unsynced', $data.notes_unsynced);

		if ($data.noteAddingMode === NoteAddingMode.FROM_PROMPT) {
			if (!$data.shouldKeepPrompt) {
				deleteCurrentPrompt()
			}
			selectNoteAddingMode(NoteAddingMode.FROM_PROMPT);
		}
	}

	function deleteCurrentPrompt() {
		const current_prompt = $data.current_prompt;
		if ($data.prompts_synced.includes(current_prompt)) {
			console.log("deleting current prompt from synced")
			$data.prompts_synced = $data.prompts_synced.filter((e: string) => e!=current_prompt);
			rememberPromptsSynced();
			$data.prompts_deleted.push(current_prompt);
			rememberPromptsDeleted();
		}
		console.log(`deleting current "${$data.current_prompt}" from unsynced`)
		$data.prompts_unsynced = $data.prompts_unsynced.filter((e: string) => e!=current_prompt);
		console.log("$data.prompts_synced.includes(current_prompt)")
		console.log($data.prompts_synced.includes(current_prompt))
		rememberPromptsUnsynced();
		selectNoteAddingMode(NoteAddingMode.FROM_PROMPT);
	}

	// @ts-ignore
	$: current_presets_hue_as_number = Math.floor($data.current_preset_for_notes?.hue || 0);

	let debounceTimeout: ReturnType<typeof setTimeout>;
	function debounce(callback: Function, delay: number = 200) {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(()=>{
			callback()
		}, delay);
	}

	$: $data.current_preset_for_notes && iframe_source_template && calculateIframeWithReplacements();

	let cardFormWidth: number;
	let cardFormAndRelatedHeight: number;
	let layoutWidth: number;
	let innerWidth: number;
	let innerHeight: number;

	$: twoColumnsCondition = layoutWidth - cardFormWidth > 330;

	let is_iframe_moved_to_top = false;

	function resetFieldValueToDefault(i: number) {
		$data.current_preset_for_notes.fields[i].current_inputs = JSON.parse(JSON.stringify($data.current_preset_for_notes.fields[i].default));
		rememberCurrentPreset();
	}

	function changeFieldCurrentlyFrozen(i: number) {
		$data.current_preset_for_notes.fields[i].currently_frozen = !($data.current_preset_for_notes.fields[i].currently_frozen);
		rememberCurrentPreset();
	}

	function changeFieldCurrentlyVisible(i: number) {
		$data.current_preset_for_notes.fields[i].currently_visible = !($data.current_preset_for_notes.fields[i].currently_visible);
		rememberCurrentPreset();
	}

	function toggleAllFieldsVisible() {
		$data.currently_all_forced_visible = !$data.currently_all_forced_visible;
		localStorage.setItem('currently_all_forced_visible', $data.currently_all_forced_visible);
	}

	function handleNoteFieldInputKeydown(event: any, fieldIndex: number) {
		if (event.altKey && !event.ctrlKey) {
			if (event.key == "m" || event.key == "M") {
				// @ts-ignore
				let index = Object.values(NoteAddingMode).indexOf($data.noteAddingMode);
				const length = Object.values(NoteAddingMode).length;
				if (event.shiftKey) {
					index = ((index - 1) + length) % length;
				} else {
					index = (index + 1) % length;
				}
				selectNoteAddingMode(Object.values(NoteAddingMode)[index]);
			}
			if (event.key == "p" || event.key == "P") {
				let preset = $data.presets.find((preset: Preset) => preset.last_edited === $data.current_preset_for_notes?.last_edited);
				// let index = $data.presets.indexOf($data.current_preset_for_notes);
				let index = $data.presets.indexOf(preset);
				const length = $data.presets.length;
				if (event.shiftKey) {
					index = ((index - 1) + length) % length;
				} else {
					index = (index + 1) % length;
				}
				selectPreset($data.presets[index]);
			}
			if (event.key == "i" || event.key == "I") {
				let iframe = $data.current_preset_for_notes.iframes.find((i: [string, string])=>i[1] == iframe_source_template)
				let index = $data.current_preset_for_notes.iframes.indexOf(iframe);
				const length = $data.current_preset_for_notes.iframes.length;
				if (event.shiftKey) {
					index = ((index - 1) + length) % length;
				} else {
					index = (index + 1) % length;
				}
				iframe_source_template = $data.current_preset_for_notes.iframes[index][1];
			}
		}
		if (event.altKey && !event.ctrlKey && !event.shiftKey) {
			event.preventDefault();
			if (event.key == "f" || event.key == "l") {
				changeFieldCurrentlyFrozen(fieldIndex);
			} else if (event.key == "r") {
				resetFieldValueToDefault(fieldIndex);
			} else if (event.key == "v") {
				changeFieldCurrentlyVisible(fieldIndex);
			} else if (event.key == "a") {
				toggleAllFieldsVisible();
			} else if ($data.noteAddingMode === NoteAddingMode.FROM_PROMPT && event.key == "d") {
				$data.shouldKeepPrompt = false;
				rememberShouldKeepPrompt();
			} else if ($data.noteAddingMode === NoteAddingMode.FROM_PROMPT && event.key == "k") {
				$data.shouldKeepPrompt = true;
				rememberShouldKeepPrompt();
			}
		}
		if (event.altKey && !event.ctrlKey && event.shiftKey) {
			if ($data.noteAddingMode === NoteAddingMode.FROM_PROMPT && event.key == "D") {
				deleteCurrentPrompt();
			}
		}
		if (event.key == "ArrowUp" && (event.target.type == "text" || event.target.tagName == "TEXTAREA")) {
			let index = event.target.id.replace('field','')
			let newFocusElem;
			for (let i=index-1; i>=0; i--) {
				newFocusElem = document.getElementById(`field${i}`);
				if (newFocusElem && (newFocusElem.getAttribute('type') == "text" || newFocusElem.tagName == "TEXTAREA")) {
					newFocusElem!.setAttribute('tabindex', '0')
					newFocusElem!.focus();
					break;
				}
			}
		}
		if (event.key == "ArrowDown" && (event.target.type == "text" || event.target.tagName == "TEXTAREA")) {
			let index = event.target.id.replace('field','')
			let newFocusElem
			for (let i=index-(-1); i<$data.current_preset_for_notes.fields.length; i++) {
				newFocusElem = document.getElementById(`field${i}`);
				if (newFocusElem && (newFocusElem.getAttribute('type') == "text" || newFocusElem.tagName == "TEXTAREA")) {
					newFocusElem!.setAttribute('tabindex', '0')
					newFocusElem!.focus();
					break;
				};
			}
		}
	}

	function getFirstPrompt(){
		return $data.prompts_synced[0] ?? $data.prompts_unsynced[0] ?? '';
	}

	function selectNoteAddingMode(mode: NoteAddingMode) {
		$data.noteAddingMode = mode;
		localStorage.setItem('noteAddingMode', mode);
		if (mode === NoteAddingMode.FROM_PROMPT && $data.current_preset_for_notes) {
			console.log("$data.prompts_unsynced.includes(getFirstPrompt())")
			console.log($data.prompts_unsynced.includes(getFirstPrompt()))
			$data.current_prompt = getFirstPrompt();
			console.log(`current_prompt = ${$data.current_prompt}`)
			localStorage.setItem('current_prompt', JSON.stringify($data.current_prompt));
			console.log("setting an input to current_prompt")
			$data.current_preset_for_notes.fields[$data.promptedFieldIndex].current_inputs[0] = $data.current_prompt;
			rememberCurrentPreset();
		}
	}

	function delete_all_prompts() {
		$data.prompts_unsynced = [];
		localStorage.setItem('prompts_unsynced', '[]');
		$data.prompts_deleted = $data.prompts_synced;
		localStorage.setItem('prompts_deleted', $data.prompts_synced);
		$data.current_prompt = '';
		localStorage.setItem('current_prompt', $data.current_prompt);
		sync_prompts();
	}

	function delete_local_prompts() {
		$data.prompts_unsynced = [];
		localStorage.setItem('prompts_unsynced', '[]');
		if (!$data.prompts_synced.includes($data.current_prompt)) {
			$data.current_prompt = '';
			localStorage.setItem('current_prompt', $data.current_prompt);
		}
	}

	function sync_prompts() {
		const data = JSON.stringify([
			$data.prompts_unsynced,
			$data.prompts_deleted,
		]);
		axios
			.post($data.backend_url + '/sync_prompts', data, {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.prompts_synced = response.data;
				localStorage.setItem('prompts_synced', JSON.stringify($data.prompts_synced));
				$data.prompts_unsynced = [];
				localStorage.setItem('prompts_unsynced', '[]');
				$data.prompts_deleted = [];
				localStorage.setItem('prompts_deleted', '[]');
				$data.current_prompt = getFirstPrompt();
				localStorage.setItem('current_prompt', JSON.stringify($data.current_prompt));
				if ($data.noteAddingMode === NoteAddingMode.FROM_PROMPT) {
					console.log("setting an input to current_prompt")
					$data.current_preset_for_notes.fields[$data.promptedFieldIndex].current_inputs[0] = $data.current_prompt;
				}
				showSuccessToast($data.toastStore, "Synced prompts");
			})
			.catch((error) => {
				console.error(error);
				showErrorToast($data.toastStore, "Prompts sync failed!");
			});
	}

	$: preset_fields_for_duplicate_checking = $data.note_export_columns_for_duplicate_checking.map((e: number)=>e+$data.preset_fields_for_duplicate_checking_offset);
</script>

<svelte:window bind:innerHeight bind:innerWidth />
<div class="w-full" bind:clientWidth={layoutWidth} />

<div class={`flex w-full ${$data.current_preset_for_notes?.iframes?.length ? 'w-full' : ''} ${twoColumnsCondition ? 'space-x-0 flex-row' : 'flex-col space-y-10'}`}>
	<div class="space-y-4 text-center flex flex-col items-center">
		<h2 class="h2 mt-12">Create a card</h2>

		<div class="card p-2 ml-6 mr-6">
			{#each Object.values(NoteAddingMode) as noteAddingMode, i}
				<button
					style={`color: hsl(${120+i*40} ${
						$data.noteAddingMode == noteAddingMode
							? '100% 20%); background-color: hsl(' + 120+i*40 + ' 100% 87%);'
							: '70% 50%);'
					}`}
					class={`btn ${
						$data.current_preset_for_notes?.name == noteAddingMode ? 'variant-filled' : 'variant-ghost'
					} m-0.5`}
					on:click={() => selectNoteAddingMode(noteAddingMode)}
				>
					{noteAddingMode}
				</button>
			{/each}
		</div>

		{#if $data.presets.length}
			<!-- TODO -->
			<!-- <RadioGroup class="card">
				{#each $data.presets as preset}
					<RadioItem
						class={`${$data.current_preset_for_notes?.name !== preset.name ? 'variant-ghost' : ''}`}
						bind:group={$data.current_preset_for_notes}
						name="type"
						value={preset}>{preset.name}</RadioItem
					>
				{/each}
			</RadioGroup> -->
			{#if ($data.noteAddingMode === NoteAddingMode.FROM_SCRATCH || $data.noteAddingMode === NoteAddingMode.FROM_PROMPT)}
			<div class="card p-2 ml-6 mr-6">
				{#each $data.presets as preset}
					<button
						style={`color: hsl(${preset.hue} ${
							$data.current_preset_for_notes?.name == preset.name
								? '100% 20%); background-color: hsl(' + preset.hue + ' 100% 87%);'
								: '70% 50%);'
						}`}
						class={`btn ${
							$data.current_preset_for_notes?.name == preset.name ? 'variant-filled' : 'variant-ghost'
						} m-0.5`}
						on:click={() => selectPreset(preset)}
					>
						{preset.name}
					</button>
				{/each}
			</div>
			{/if}

			{#if $data.current_preset_for_notes && ($data.noteAddingMode === NoteAddingMode.FROM_SCRATCH || $data.noteAddingMode === NoteAddingMode.FROM_PROMPT)}
				{#if did_current_preset_change}
					<div class="card p-4 variant-ghost-error">
						The current preset has been updated! To load the changes, press its name again. Current input will be lost!
					</div>
				{/if}

				{#if $data.current_preset_for_notes?.iframes?.length && is_iframe_moved_to_top}
					<IframesComponent
						class="flex-col-reverse"
						style={`height: calc(calc(100vh - 7rem) - ${cardFormAndRelatedHeight}px);`}
						bind:iframe_source_template
						bind:is_moved_to_top={is_iframe_moved_to_top}
						is_on_side={twoColumnsCondition}
						selected_preset={$data.current_preset_for_notes}
						{current_presets_hue_as_number}
						iframe_with_replacements={debounced_iframe_src}
					/>
				{/if}

				<div
					bind:clientHeight={cardFormAndRelatedHeight}
					class="space-y-4 text-center flex flex-col items-center"
				>
					<div class="card p-3 variant-ghost-secondary">
						force each field visible
						<button
							type="button"
							class={`btn-icon variant-filled${$data.currently_all_forced_visible ? '-warning' : ''}`}
							style="font-weight: bold;"
							on:click={toggleAllFieldsVisible}
						>
						<abbr title={`temporarily force all field visible - (alt+a while typing)`}>
							{#if $data.currently_all_forced_visible}
								<i class="fa-solid fa-eye" />
							{:else}
								<i class="fa-solid fa-eye-slash" />
							{/if}
						</abbr>
						</button>
					</div>
					<form bind:clientWidth={cardFormWidth} on:submit|preventDefault={addNote}>
						{#if $data.noteAddingMode === NoteAddingMode.FROM_PROMPT}
							<span style={($data.prompts_synced.length || $data.prompts_unsynced.length) ? 'color: rgb(100, 200, 200)' : 'color: rgb(255, 100, 100);'}>{ $data.current_prompt || 'no current prompt' }</span>
						{/if}
						<div style={`display: grid; grid-template-columns: 8.58rem 1fr 2.86rem 2.86rem${$data.currently_all_forced_visible ? ' 2.86rem' : ''};`}>
							{#each $data.current_preset_for_notes.fields as field, i}
								{#if field.currently_visible || $data.currently_all_forced_visible}
									<label for={`field${i}`} style="display: flex; justify-content: center; align-items: center;">
										{field.name}
									</label>
									{#if field.type === 'text'}
										<input
											id={`field${i}`}
											on:keydown={(e)=>handleNoteFieldInputKeydown(e, i)}
											type="text"
											style={field.current_inputs[0] && 
												(preset_fields_for_duplicate_checking.includes(i)
												&& ($data.duplicate_checking_values_synced.includes(transformTextForDuplicateCheck(field.current_inputs[0], $data.duplicate_checking_removed_needles))
												|| $data.duplicate_checking_values_unsynced.includes(transformTextForDuplicateCheck(field.current_inputs[0], $data.duplicate_checking_removed_needles))))
												? "color: rgb(200, 0, 0);" : ""}
											bind:value={field.current_inputs[0]}
											on:input={rememberCurrentPreset}
										/>
									{:else if field.type === 'selectOne'}
										<RadioGroup on:keydown={(e)=>handleNoteFieldInputKeydown(e, i)}>
											{#each field.options as option}
												<RadioItem on:keydown={(e)=>handleNoteFieldInputKeydown(e, i)} id={`field${i}`} bind:group={field.current_inputs[0]} on:change={rememberCurrentPreset} name="type" value={option}
													>{option || '(empty)'}</RadioItem
												>
											{/each}
										</RadioGroup>
									{:else if field.type === 'selectMany'}
										<ListBox multiple>
											<div class="card" style="display: flex; flex-direction: row;">
												{#each field.options as option}
													<ListBoxItem on:keydown={(e)=>handleNoteFieldInputKeydown(e, i)} id={`field${i}`} bind:group={field.current_inputs} on:change={rememberCurrentPreset} name="type" value={option}
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
									<!-- svelte-ignore a11y-positive-tabindex -->
									<button
										tabindex="1"
										style="width: 2.574rem;"
										class="btn btn-large variant-filled"
										type="button"
										on:click={() => resetFieldValueToDefault(i)}
									>
										<abbr title={`reset to "${field.default}" (alt+r while typing)`}
											><i class="fa-solid fa-rotate-left" /></abbr
										>
									</button>
									<!-- svelte-ignore a11y-positive-tabindex -->
									<button
										tabindex="1"
										style="width: 2.574rem;"
										class="btn btn-large {!field.currently_frozen ? 'variant-filled' : 'variant-ghost'}"
										type="button"
										on:click={() => {changeFieldCurrentlyFrozen(i)}}
									>
										<abbr title={`toggle resetting to "${field.default}" on submit - (alt+f or alt+l while typing)`}>
											{#if field.currently_frozen}
												<i class="fa-solid fa-lock" />
											{:else}
												<i class="fa-solid fa-lock-open" />
											{/if}
										</abbr>
									</button>
									{#if $data.currently_all_forced_visible}
										<!-- svelte-ignore a11y-positive-tabindex -->
										<button
											tabindex="1"
											style="width: 2.574rem;"
											class="btn btn-large {field.currently_visible
												? `variant-filled${field.visible_by_default ? '' : '-warning'}`
												: `variant-ghost${field.visible_by_default ? '-warning' : ''}`}"
												type="button"
											on:click={() => changeFieldCurrentlyVisible(i)}
										>
											<abbr title={`toggle visibility - (alt+v while typing)`}>
												{#if field.currently_visible}
													<i class="fa-solid fa-eye" />
												{:else}
													<i class="fa-solid fa-eye-slash" />
												{/if}
											</abbr>
										</button>
									{/if}
								{/if}
							{/each}
							{#if $data.noteAddingMode === NoteAddingMode.FROM_PROMPT}
								<label for='fieldKeepPrompt' class="mt-2" style="display: flex; justify-content: center; align-items: center;">
									{"prompt"}
								</label>
								<RadioGroup class="mt-2">
									{#each [{label: "keep", value: true}, {label: "destroy", value: false}] as option}
										<RadioItem id='fieldKeepPrompt' bind:group={$data.shouldKeepPrompt} on:change={rememberShouldKeepPrompt} name="shouldKeepPrompt" value={option.value}
											>{option.label}</RadioItem
										>
									{/each}
								</RadioGroup>
							{/if}
						</div>
						{#if $data.noteAddingMode == NoteAddingMode.FROM_PROMPT}
							<button
								type="button"
								on:click={deleteCurrentPrompt}
								class="btn btn-large variant-filled-primary"
							>
								delete prompt
							</button>
						{/if}
						<button
							type="submit"
							style="margin-top: 0.858rem;"
							class="btn btn-large variant-filled-success">add card</button
						>
					</form>
					<div style="max-width: 30rem; line-break: anywhere;">
						current result: <br><span>{current_output}</span>
					</div>
					<button class="btn-icon variant-filled-success" on:click={sync_prompts}>
						<i class="fa-solid fa-rotate" />
					</button>
				</div>
			{/if}
			{#if $data.noteAddingMode === NoteAddingMode.NEW_PROMPT}
				<form on:submit|preventDefault={()=>addOnePrompt()}>
					<label>new prompt
						<input
							id="field1"
							type="text"
							bind:value={$data.currentlyWrittenPrompt}
							on:input={rememberCurrentlyWrittenPrompt}
							on:keydown={(e)=>handleNoteFieldInputKeydown(e, 1)}
						>
					</label>
					<button
						type="submit"
						style="margin-top: 0.858rem;"
						class="btn btn-large variant-filled-success"
					>
						add prompt
					</button>
				</form>

				<h2 class='h2'>Add multiple prompts</h2>
				<form on:submit|preventDefault={addPromptsFromList}>
					<label class="flex items-center justify-between w-full">
						<div>new prompts</div>
						<textarea
							id="field2"
							style="color: black;"
							bind:value={$data.currentlyWrittenPromptList}
							on:input={rememberCurrentlyWrittenPromptList}
							on:keydown={(e)=>handleNoteFieldInputKeydown(e, 2)}
						></textarea>
					</label>
					<label>prompt separator
						<input
							id="field3"
							type="text"
							placeholder="space (default)"
							bind:value={$data.currentPromptListSeparator}
							on:input={rememberCurrentPromptListSeparator}
							on:keydown={(e)=>handleNoteFieldInputKeydown(e, 3)}
						>
					</label>
					<button
						type="submit"
						style="margin-top: 0.858rem;"
						class="btn btn-large variant-filled-success"
					>
						add prompt
					</button>
				</form>

				<div style="color: yellow">
					{#if $data.prompts_unsynced.length }
						unsynced prompts: "{ $data.prompts_unsynced.join('", "') }"
					{:else}
						no unsynced prompts
					{/if}
				</div>

				<div style="color: green">
					{#if $data.prompts_synced.length }
						synced prompts: "{ $data.prompts_synced.join('", "') }"
					{:else}
						no synced prompts
					{/if}
				</div>

				<div style="color: red">
					{#if $data.prompts_deleted.length }
						prompts for sync deleting: "{ $data.prompts_deleted.join('", "') }"
					{:else}
						no promps for sync deleting
					{/if}
				</div>
				<div class="flex flex-row w-full justify-center gap-2">
					<button class="btn variant-filled-primary" on:click={delete_all_prompts}>delete all</button>
					<button class="btn variant-filled-primary" on:click={delete_local_prompts}>delete unsynced</button>
					<button class="btn-icon variant-filled-success" on:click={sync_prompts}>
						<i class="fa-solid fa-rotate" />
					</button>
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
	{#if $data.current_preset_for_notes?.iframes?.length && (!is_iframe_moved_to_top || twoColumnsCondition)}
		<IframesComponent
			class="mt-10"
			style="height: calc(100vh - 7rem);"
			bind:iframe_source_template
			bind:is_moved_to_top={is_iframe_moved_to_top}
			is_on_side={twoColumnsCondition}
			selected_preset={$data.current_preset_for_notes}
			{current_presets_hue_as_number}
			iframe_with_replacements={debounced_iframe_src}
		/>
	{/if}
</div>

<style lang="postcss">
	input {
		color: black;
	}
</style>
