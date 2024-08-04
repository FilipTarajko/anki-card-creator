import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { NoteAddingMode, type Field, type Preset } from './types';
import axios from 'axios';

export let default_fields = [
		{
			id: 0,
			name: 'deck',
			type: 'bound',
			options: [],
			default: [],
			visible_by_default: true,
			frozen_by_default: true,
			current_inputs: [],
			bound_to: 5,
			bindings: [
				['nl', 'Dutch'],
				['en', 'English']
			],
			binding_type: 'equals'
		},
		{
			id: 1,
			name: 'notetype',
			type: 'selectOne',
			options: ['2X26', '3X26'],
			default: ['2X26'],
			visible_by_default: false,
			frozen_by_default: true,
			current_inputs: []
		},
		{
			id: 2,
			name: 'tags',
			type: 'selectMany',
			options: ['AnkiCC', 'test', 'test::AnkiCC', 'test::foo::baz::baz'],
			default: ['AnkiCC', 'test'],
			visible_by_default: false,
			frozen_by_default: true,
			current_inputs: []
		},
		{
			id: 3,
			name: 'front',
			type: 'text',
			options: [],
			default: [],
			visible_by_default: true,
			frozen_by_default: false,
			current_inputs: []
		},
		{
			id: 4,
			name: 'back',
			type: 'text',
			options: [],
			default: [],
			visible_by_default: true,
			frozen_by_default: false,
			current_inputs: []
		},
		{
			id: 5,
			name: 'rev',
			type: 'selectOne',
			options: ['', 'y'],
			default: [''],
			visible_by_default: true,
			frozen_by_default: true,
			current_inputs: []
		},
		{
			id: 6,
			name: 'info',
			type: 'text',
			options: [],
			default: [],
			visible_by_default: true,
			frozen_by_default: false,
			current_inputs: []
		},
		{
			id: 7,
			name: 'source',
			type: 'text',
			options: [],
			default: [],
			visible_by_default: true,
			frozen_by_default: false,
			current_inputs: []
		},
		{
			id: 8,
			name: 'theme',
			type: 'selectOne',
			options: ['nl', 'en', 'de', 'pl'],
			default: [],
			visible_by_default: true,
			frozen_by_default: true,
			current_inputs: []
		}
	];

export const data = writable({
	backend_url: PUBLIC_BACKEND_URL,
	notes_synced: (browser && window.localStorage.getItem('notes_synced')) || '',
	notes_unsynced: (browser && window.localStorage.getItem('notes_unsynced')) || '',
	ids_of_presets_to_remove:
		(browser && JSON.parse(window.localStorage.getItem('ids_of_presets_to_remove') ?? '[]')) || [],
	prefix_for_exports: `#separator:Semicolon\n#deck column:1\n#notetype column:2\n#tags column:3\n`,
	current_page: (browser && window.localStorage.getItem('current_page')) || 'about',
	jwt: (browser && window.localStorage.getItem('jwt')) || '',
	username: (browser && window.localStorage.getItem('username')) || '',
	email: (browser && window.localStorage.getItem('email')) || '',
	id: (browser && window.localStorage.getItem('id')) || '',
	display_csv_headers:
		(browser && JSON.parse(window.localStorage.getItem('display_csv_headers') ?? 'false')) || false,
	duplicate_checking_values_synced: (browser && JSON.parse(window.localStorage.getItem('duplicate_checking_values_synced') ?? '[]')) ?? [],
	duplicate_checking_values_unsynced: (browser && JSON.parse(window.localStorage.getItem('duplicate_checking_values_unsynced') ?? '[]')) ?? [],
	note_export_columns_for_duplicate_checking: (browser && JSON.parse(window.localStorage.getItem('note_export_columns_for_duplicate_checking') ?? 'false')) || [0, 1],
	preset_fields_for_duplicate_checking_offset: 3,
	duplicate_checking_removed_needles: [/^(de)\s/, /^(het)\s/, /^.$/, /^de\/het\s/, /^the\s/],
	current_preset_for_notes: (browser && JSON.parse(window.localStorage.getItem('current_preset_for_notes') ?? 'false')),
	currently_all_forced_visible: (browser && JSON.parse(window.localStorage.getItem('currently_all_forced_visible') ?? 'false')),
	isSidebarShownOnNarrow: (browser && JSON.parse(window.localStorage.getItem('isSidebarShownOnNarrow') ?? 'true' )),
	toastStore: null,
	noteAddingMode: (browser && window.localStorage.getItem('noteAddingMode')) ?? NoteAddingMode.FROM_SCRATCH,
	currentlyWrittenPrompt: (browser && window.localStorage.getItem('currentlyWrittenPrompt')) ?? '',
	currentlyWrittenPromptList: (browser && window.localStorage.getItem('currentlyWrittenPromptList')) ?? '',
	currentPromptListSeparator: (browser && window.localStorage.getItem('currentPromptListSeparator')) ?? '',
	prompts_unsynced: (browser && JSON.parse(window.localStorage.getItem('prompts_unsynced') ?? '[]')) ?? [],
	prompts_synced: (browser && JSON.parse(window.localStorage.getItem('prompts_synced') ?? '[]')) ?? [],
	prompts_deleted: (browser && JSON.parse(window.localStorage.getItem('prompts_deleted') ?? '[]')) ?? [],
	current_prompt: (browser && window.localStorage.getItem("current_prompt")) ?? '',
	shouldKeepPrompt: (browser && JSON.parse(window.localStorage.getItem('shouldKeepPrompt') ?? 'true')),
	promptedFieldIndex: 3,
});

export const selected_preset: Writable<Preset | null> = writable(null);
export const fields: Writable<Field[]> = writable(JSON.parse(JSON.stringify(default_fields)));
export const presets = writable((browser && JSON.parse(window.localStorage.getItem('presets') ?? '[]')) || []);

export function transformTextForDuplicateCheck(text: string, duplicate_checking_removed_needles: (string|RegExp)[]) {
	text = text.toLowerCase();
	duplicate_checking_removed_needles.forEach(needle=>{
		if (needle instanceof RegExp && !needle.global) {
			text = text.replace(needle, "")
		} else {
			text = text.replaceAll(needle, "");
		}
	})
	return text;
}

export function appendToDuplicateCheckingValuesUnsynced(data: {duplicate_checking_values_unsynced: string[], duplicate_checking_removed_needles: (string|RegExp)[]}, values: string[]) {
	for (let i=0; i<values.length; i++) {
		const val = transformTextForDuplicateCheck(values[i], data.duplicate_checking_removed_needles);
		if (!val || data.duplicate_checking_values_unsynced.includes(val)) {
			continue;
		}
		data.duplicate_checking_values_unsynced.push(val);
	}
	localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify(data.duplicate_checking_values_unsynced));
}

export function showToast(toastStore: any, message: string, background: string) {
	toastStore.trigger({
		message,
		background,
		timeout: 5000,
		autohide: true,
		hideDismiss: false,
	})
}

export function showSuccessToast(toastStore: any, message: string) {
	showToast(toastStore, message, 'variant-filled-success');
}

export function showErrorToast(toastStore: any, message: string) {
	showToast(toastStore, message, 'variant-filled-primary');
}

export function showWarningToast(toastStore: any, message: string) {
	showToast(toastStore, message, 'variant-filled-warning');
}

export function sync_notes(data: any) {
	axios
		.post(data.backend_url + '/sync_notes', JSON.stringify(data.notes_unsynced), {
			headers: {
				Authorization: `Bearer ${data.jwt}`,
				'Content-Type': 'application/json'
			}
		})
		.then((response) => {
			data.notes_synced = response.data;
			localStorage.setItem('notes_synced', data.notes_synced);
			data.notes_unsynced = '';
			localStorage.setItem('notes_unsynced', '');
			showSuccessToast(data.toastStore, 'Notes synced!');
		})
		.catch((error) => {
			console.error(error);
			showErrorToast(data.toastStore, 'Notes sync failed!');
		});
}

export function sync_prompts(data: any) {
	const requestPayload = JSON.stringify([
		data.prompts_unsynced,
		data.prompts_deleted,
	]);
	axios
		.post(data.backend_url + '/sync_prompts', requestPayload, {
			headers: {
				Authorization: `Bearer ${data.jwt}`,
				'Content-Type': 'application/json'
			}
		})
		.then((response) => {
			data.prompts_synced = response.data;
			localStorage.setItem('prompts_synced', JSON.stringify(data.prompts_synced));
			data.prompts_unsynced = [];
			localStorage.setItem('prompts_unsynced', '[]');
			data.prompts_deleted = [];
			localStorage.setItem('prompts_deleted', '[]');
			data.current_prompt = getFirstPrompt(data);
			localStorage.setItem('current_prompt', JSON.stringify(data.current_prompt));
			if (data.noteAddingMode === NoteAddingMode.FROM_PROMPT) {
				console.log("setting an input to current_prompt")
				data.current_preset_for_notes.fields[data.promptedFieldIndex].current_inputs[0] = data.current_prompt;
			}
			showSuccessToast(data.toastStore, "Synced prompts");
		})
		.catch((error) => {
			console.error(error);
			showErrorToast(data.toastStore, "Prompts sync failed!");
		});
}

export function sync_presets(data: any, presets: any) {
	axios
		.post(
			data.backend_url + '/sync_presets',
			JSON.stringify([
				presets.filter((e: Preset) => e.status == 'unsynced'),
				presets.filter((e: Preset) => e.status == 'to_update'),
				data.ids_of_presets_to_remove || []
			]),
			{
				headers: {
					Authorization: `Bearer ${data.jwt}`,
					'Content-Type': 'application/json'
				}
			}
		)
		.then((response) => {
			console.log(response);
			if (response.status === 200) {
				console.log(response.data[0]);
				let sync_report = response.data[0];
				if (sync_report.ignored_presets.length > 0) {
					showWarningToast(
						data.toastStore,
						`Some presets were later changed on different device!<br/>${sync_report.ignored_presets.join(
							'<br/>'
						)}`
					);
				}
				if (sync_report.unfound_presets.length > 0) {
					showWarningToast(
						data.toastStore,
						`You had changes to already-deleted presets!<br/>${sync_report.unfound_presets.join(
							'<br/>'
						)}`
					);
				}
				if (sync_report.ignored_presets.length == 0 && sync_report.unfound_presets.length == 0) {
					showSuccessToast(data.toastStore, 'Presets synced!');
				}
				presets = response.data[1];
				localStorage.setItem('presets', JSON.stringify(presets));
				data.ids_of_presets_to_remove = [];
				localStorage.setItem('ids_of_presets_to_remove', JSON.stringify([]));
				data.fields = JSON.parse(JSON.stringify(default_fields));
				data.selected_preset = null;
			}
		})
		.catch((error) => {
			console.error(error);
			showErrorToast(data.toastStore, 'Presets sync failed!');
		});
}

export function sync_unique_questions(data: any) {
	console.log(JSON.parse(JSON.stringify(data.duplicate_checking_values_unsynced)))
	console.log("will sync")
	axios
		.post(data.backend_url + '/sync_unique_questions', JSON.stringify(data.duplicate_checking_values_unsynced ?? []), {
			headers: {
				Authorization: `Bearer ${data.jwt}`,
				'Content-Type': 'application/json'
			}
		})
		.then((response) => {
			data.duplicate_checking_values_synced = response.data;
			localStorage.setItem('duplicate_checking_values_synced', JSON.stringify(data.duplicate_checking_values_synced));
			data.duplicate_checking_values_unsynced = [];
			localStorage.setItem('duplicate_checking_values_unsynced', '[]');
			showSuccessToast(data.toastStore, "Synced unique question list");
		})
		.catch((error) => {
			console.error(error);
			showErrorToast(data.toastStore, "Unique question list sync failed!");
		});
}

export function sync_all(data: any, presets: any) {
	sync_presets(data, presets);
	sync_unique_questions(data);
	sync_prompts(data);
	sync_notes(data);
}

export function getFirstPrompt(data: any){
		if (data.current_prompt && (data.prompts_synced.includes(data.current_prompt) || data.prompts_unsynced.includes(data.current_prompt))) {
			return data.current_prompt;
		}
		return data.prompts_synced[0] ?? data.prompts_unsynced[0] ?? '';
	}