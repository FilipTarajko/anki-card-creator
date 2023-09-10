import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const data = writable({
	string_for_import: (browser && window.localStorage.getItem('string_for_import')) || '',
	presets: (browser && JSON.parse(window.localStorage.getItem('presets') ?? '[]')) || []
});
