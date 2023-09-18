import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const data = writable({
	notes_synced: (browser && window.localStorage.getItem('notes_synced')) || '',
	notes_unsynced: (browser && window.localStorage.getItem('notes_unsynced')) || '',
	presets: (browser && JSON.parse(window.localStorage.getItem('presets') ?? '[]')) || [],
	ids_of_presets_to_remove:
		(browser && JSON.parse(window.localStorage.getItem('ids_of_presets_to_remove') ?? '[]')) || [],
	prefix_for_exports: `#separator:Semicolon\n#deck column:1\n#notetype column:2\n#tags column:3\n`,
	current_page: (browser && window.localStorage.getItem('current_page')) || '0',
	jwt: (browser && window.localStorage.getItem('jwt')) || '',
	username: (browser && window.localStorage.getItem('username')) || '',
	email: (browser && window.localStorage.getItem('email')) || '',
	id: (browser && window.localStorage.getItem('id')) || ''
});
