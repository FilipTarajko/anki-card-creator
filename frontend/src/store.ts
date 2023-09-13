import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const data = writable({
	string_for_export: (browser && window.localStorage.getItem('string_for_export')) || '',
	presets: (browser && JSON.parse(window.localStorage.getItem('presets') ?? '[]')) || [],
	prefix_for_exports: `#separator:Semicolon\n#deck column:1\n#notetype column:2\n#tags column:3\n`,
	current_page: (browser && window.localStorage.getItem('current_page')) || '0'
});
