import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const data = writable({
	presets: (browser && JSON.parse(window.localStorage.getItem('presets') ?? '[]')) || []
});
