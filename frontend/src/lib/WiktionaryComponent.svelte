<script lang="ts">
	let wiktionary_search = '';
	let wiktionary_language = '';
	let wiktionary_page = 'https://en.wiktionary.org/wiki/';

	function update_wiktionary_page() {
		wiktionary_page =
			'https://en.wiktionary.org/wiki/' + wiktionary_search + '#' + wiktionary_language;
	}
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
