<script lang="ts">
	import { browser } from '$app/environment';

	let wiktionary_search = (browser && window.localStorage.getItem('wiktionary_search')) || '';
	let wiktionary_language = (browser && window.localStorage.getItem('wiktionary_language')) || '';
	let wiktionary_page = 'https://en.wiktionary.org/wiki/';

	function update_wiktionary_page() {
		wiktionary_page =
			'https://en.wiktionary.org/wiki/' + wiktionary_search + '#' + wiktionary_language;
		window.localStorage.setItem('wiktionary_search', wiktionary_search);
		window.localStorage.setItem('wiktionary_language', wiktionary_language);
	}

	browser && update_wiktionary_page();
</script>

<h2 class="h2 mt-12 mb-6">Wiktionary</h2>
<div style="display: flex; flex-direction: row; justify-content: center; gap: 1rem;">
	<input type="text" bind:value={wiktionary_language} placeholder="Language" />
	<input type="text" bind:value={wiktionary_search} placeholder="word" />
	<button on:click={update_wiktionary_page} class="btn variant-filled">search</button>
</div>
<iframe
	src={wiktionary_page}
	title="wiktionary page"
	style="width: 95%; height: calc(100vh - 17rem);"
/>

<style scoped>
	input {
		color: black;
	}
</style>
