<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		LightSwitch,
		AppRail,
		AppRailTile,
		AppRailAnchor
	} from '@skeletonlabs/skeleton';

	// Highlight JS
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	let currentTile = 0;
</script>

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
			<AppRailTile bind:group={currentTile} name="tile-2" value={1} title="tile-2">
				<svelte:fragment slot="lead"><i class="fa-solid fa-square-plus fa-xl" /></svelte:fragment>
				<span>add cards</span>
			</AppRailTile>
			<AppRailTile bind:group={currentTile} name="tile-1" value={0} title="tile-1">
				<svelte:fragment slot="lead"><i class="fa-solid fa-clipboard-list fa-xl" /></svelte:fragment
				>
				<span>presets</span>
			</AppRailTile>
			<AppRailTile bind:group={currentTile} name="tile-3" value={2} title="tile-3">
				<svelte:fragment slot="lead"><i class="fa-solid fa-file-export fa-xl" /></svelte:fragment>
				<span>export</span>
			</AppRailTile>
			<AppRailTile bind:group={currentTile} name="tile-4" value={3} title="tile-4">
				<svelte:fragment slot="lead"
					><i class="fa-solid fa-circle-question fa-xl" /></svelte:fragment
				>
				<span>guide</span>
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
