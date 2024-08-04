import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { NoteAddingMode } from './types';

export const data = writable({
	backend_url: PUBLIC_BACKEND_URL,
	notes_synced: (browser && window.localStorage.getItem('notes_synced')) || '',
	notes_unsynced: (browser && window.localStorage.getItem('notes_unsynced')) || '',
	presets: (browser && JSON.parse(window.localStorage.getItem('presets') ?? '[]')) || [],
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
	shouldKeepPrompt: (browser && JSON.parse(window.localStorage.getItem('shouldKeepPrompt') ?? 'true')),
	promptedFieldIndex: 3,
});

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
