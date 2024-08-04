<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		LightSwitch,
		AppRail,
		AppRailTile,
		Toast,
		AppRailAnchor
	} from '@skeletonlabs/skeleton';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	// Highlight JS
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import { data } from '../store';

	// For toasts, modals etc.
	import { initializeStores } from '@skeletonlabs/skeleton';
	initializeStores();
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();
	// @ts-ignore
	$data.toastStore = toastStore;

	function toggleSidebarOnNarrow() {
		$data.isSidebarShownOnNarrow = !$data.isSidebarShownOnNarrow;
		localStorage.setItem('isSidebarShownOnNarrow', $data.isSidebarShownOnNarrow);
	}

	let innerWidth = 0;
</script>

<svelte:head>
{@html `<style>

@media (max-width: 914px) {
	:root {
		font-size: 1.75vw;
	}
}

@media (max-width: 767px) {
	:root {
		font-size: ${$data.isSidebarShownOnNarrow ? '2.5vw' : '2.85vw'};
	}
}

</style>`
}
</svelte:head>

<Toast />
<!-- App Shell -->
<svelte:window bind:innerWidth={innerWidth} />
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<button class="w-20 left-0 h-16 cursor-pointer hover:bg-primary-500/10 absolute md:hidden" on:click={toggleSidebarOnNarrow}>
					<i class="fa-solid fa-bars fa-xl" />
				</button>
				<strong class="text-l md:text-xl uppercase ml-20 md:ml-0">Anki Card Creator</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
				<div>
					<a
						class="btn btn-sm variant-ghost-surface pr-1"
						style="border-top-right-radius: 0px; border-bottom-right-radius: 0px;"
						href="https://apps.ankiweb.net"
						target="_blank"
						rel="noreferrer"
					>
						Anki
					</a>
					<a
						class="btn btn-sm variant-ghost-surface pl-1"
						style="border-top-left-radius: 0px; border-bottom-left-radius: 0px;"
						href="https://docs.ankiweb.net"
						target="_blank"
						rel="noreferrer"
					>
						Docs
					</a>
				</div>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/FilipTarajko/anki-card-creator"
					target="_blank"
					rel="noreferrer"
				>
					Github
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		{#if $data.isSidebarShownOnNarrow || innerWidth>=768}
		<AppRail>
			<AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'about');
				}}
				name="about"
				value={'about'}
				title="about"
			>
				<svelte:fragment slot="lead"><i class="fa-solid fa-circle-info fa-xl" /></svelte:fragment>
				<span>about</span>
			</AppRailTile>
			<AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'presets');
				}}
				name="presets"
				value={'presets'}
				title="presets"
			>
				<svelte:fragment slot="lead"><i class="fa-solid fa-clipboard-list fa-xl" /></svelte:fragment
				>
				<span>presets</span>
			</AppRailTile>
			<AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'add cards');
				}}
				name="add cards"
				value={'add cards'}
				title="add cards"
			>
				<svelte:fragment slot="lead"><i class="fa-solid fa-square-plus fa-xl" /></svelte:fragment>
				<span>add cards</span>
			</AppRailTile>
			<AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'export');
				}}
				name="export"
				value={'export'}
				title="export"
			>
				<svelte:fragment slot="lead"><i class="fa-solid fa-file-export fa-xl" /></svelte:fragment>
				<span>export</span>
			</AppRailTile>
			<AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'account');
				}}
				name="account"
				value={'account'}
				title="account"
			>
				<svelte:fragment slot="lead">
					<i class="fa-solid fa-user fa-xl" /></svelte:fragment
				>
				<span>account</span>
			</AppRailTile>
			<AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'settings');
				}}
				name="settings"
				value={'settings'}
				title="settings"
			>
				<svelte:fragment slot="lead">
					<i class="fa-solid fa-gear fa-xl" /></svelte:fragment
				>
				<span>settings</span>
			</AppRailTile>
			<AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'wiktionary');
				}}
				name="wiktionary"
				value={'wiktionary'}
				title="wiktionary"
			>
				<svelte:fragment slot="lead"><i class="fa-solid fa-spell-check fa-xl" /></svelte:fragment>
				<span>wiktionary</span>
			</AppRailTile>
			<!-- <AppRailTile
				bind:group={$data.current_page}
				on:click={() => {
					localStorage.setItem('current_page', 'developed');
				}}
				name="developed"
				value={'developed'}
				title="developed"
			>
				<svelte:fragment slot="lead"><i class="fa-solid fa-laptop-code fa-xl" /></svelte:fragment>
				<span>developed</span>
			</AppRailTile> -->
			<button
				class="w-20 text-green-300 flex flex-col left-0 pt-7 pb-3 h-20 mt-8 items-center justify-between cursor-pointer hover:bg-primary-500/10"
				on:click={data.sync_all}
			>
				<i class="fa-solid fa-rotate fa-xl" />
				<span>sync all</span>
			</button>
		</AppRail>
		{/if}
	</svelte:fragment>

	<slot />
</AppShell>
