import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_BACKEND_URL } from '$env/static/public';

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
	duplicate_checking_values: (browser && JSON.parse(window.localStorage.getItem('duplicate_checking_values') ?? '[]')) ?? [],
	note_export_columns_for_duplicate_checking: [0, 1],
	preset_fields_for_duplicate_checking: [3, 4],
	duplicate_checking_removed_needles: [/^(de)\s?/, /^(het)\s?/, /^.$/],
});

export function removeNeedlesForDuplicateCheck(text: string, duplicate_checking_removed_needles: (string|RegExp)[]) {
	duplicate_checking_removed_needles.forEach(needle=>{
		if (needle instanceof RegExp && !needle.global) {
			text = text.replace(needle, "")
		} else {
			text = text.replaceAll(needle, "");
		}
	})
	return text;
}
