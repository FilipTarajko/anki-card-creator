<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		LightSwitch,
		AppRail,
		AppRailTile,
		AppRailAnchor,
		Toast
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
</script>

<Toast />
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Anki Card Creator</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://apps.ankiweb.net"
					target="_blank"
					rel="noreferrer"
				>
					Anki website
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://docs.ankiweb.net"
					target="_blank"
					rel="noreferrer"
				>
					Anki docs
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/FilipTarajko/anki-card-generator"
					target="_blank"
					rel="noreferrer"
				>
					This project's github
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<AppRail>
			<!-- <svelte:fragment slot="lead">
				<AppRailAnchor href="/">(icon)</AppRailAnchor>
			</svelte:fragment> -->
			<!-- --- -->
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
					localStorage.setItem('current_page', 'developed');
				}}
				name="developed"
				value={'developed'}
				title="developed"
			>
				<svelte:fragment slot="lead"><i class="fa-solid fa-laptop-code fa-xl" /></svelte:fragment>
				<span>developed</span>
			</AppRailTile>
			<!-- --- -->
			<!-- <svelte:fragment slot="trail">
				<AppRailAnchor href="/" target="_blank" title="Account">(icon)</AppRailAnchor>
			</svelte:fragment> -->
		</AppRail>
	</svelte:fragment>

	<!-- Page Route Content -->
	<slot />
</AppShell>
