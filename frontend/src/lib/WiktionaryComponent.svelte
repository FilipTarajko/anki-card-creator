<script lang="ts">
	import { browser } from '$app/environment';

	let wiktionary_search = (browser && window.localStorage.getItem('wiktionary_search')) || '';
	let wiktionary_language = (browser && window.localStorage.getItem('wiktionary_language')) || '';
	let wiktionary_languages = (browser &&
		JSON.parse(
			window.localStorage.getItem('wiktionary_languages') ?? '["Dutch","English","French"]'
		)) || ['Dutch', 'English', 'French'];
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
<form style="display: flex; flex-direction: row; justify-content: center; gap: 1rem;">
	<input type="text" bind:value={wiktionary_language} placeholder="Language" />
	<input type="text" bind:value={wiktionary_search} placeholder="word" />
	<button on:click={update_wiktionary_page} class="btn variant-filled">search</button>
</form>

<div style="display: flex; flex-direction: row;">
	<button
		type="button"
		class="btn-icon variant-filled-primary mr-2"
		style="font-weight: bold;"
		on:click={() => {
			// @ts-ignore
			wiktionary_languages = wiktionary_languages.filter((lang) => lang !== wiktionary_language);
			window.localStorage.setItem('wiktionary_languages', JSON.stringify(wiktionary_languages));
		}}
	>
		<i class="fa-solid fa-remove" />
	</button>
	<div class="card">
		{#each wiktionary_languages as language}
			<button
				class={`btn ${wiktionary_language == language ? 'variant-filled' : 'variant-ghost'} m-0.5`}
				on:click={() => {
					wiktionary_language = language;
					update_wiktionary_page();
				}}
			>
				{language}
			</button>
		{/each}
	</div>
	<button
		class={`ml-2 btn ${
			browser && wiktionary_languages?.includes(wiktionary_language)
				? 'disabled variant-ghost'
				: 'variant-filled'
		}`}
		on:click={() => {
			if (wiktionary_languages?.includes(wiktionary_language)) return;
			wiktionary_languages = [...wiktionary_languages, wiktionary_language];
			window.localStorage.setItem('wiktionary_languages', JSON.stringify(wiktionary_languages));
			update_wiktionary_page();
		}}>add current</button
	>
</div>

<iframe
	src={wiktionary_page}
	title="wiktionary page"
	style="width: 95%; height: calc(100vh - 19.8rem);"
/>

<style scoped>
	input {
		color: black;
	}
</style>
