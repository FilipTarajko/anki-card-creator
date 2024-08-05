<script lang="ts">
	import axios from 'axios';

	let backend_status = 'loading...';
	let mongo_status = 'loading...';
	let user_count = 'loading...';

	import { data } from '../store';

	function check_connection_to_backend() {
		backend_status = 'loading...';
		user_count = 'loading...';
		axios
			.get($data.backend_url + '/check_backend')
			.then((response) => {
				if (response.status === 200) {
					backend_status = '200';
				} else {
					backend_status = `${response.status}`;
				}
			})
			.catch((error) => {
				backend_status = error.message;
			});
	}

	function check_connection_to_backend_and_mongo() {
		mongo_status = 'loading...';
		axios
			.get($data.backend_url + '/check_mongo')
			.then((response) => {
				if (response.status === 200) {
					mongo_status = '200';
					user_count = response.data;
				} else {
					mongo_status = `${response.status}`;
				}
			})
			.catch((error) => {
				mongo_status = error.message;
			});
	}

	function add_test_user() {
		axios
			.post($data.backend_url + '/add_test_user')
			.then((response) => {
				if (response.status === 200) {
					mongo_status = '200';
					user_count = response.data;
				} else {
					mongo_status = `${response.status}`;
				}
			})
			.catch((error) => {
				mongo_status = error.message;
			});
	}

	function get_style_variant_by_state(state: string) {
		if (state === 'loading...') {
			return 'variant-filled-warning';
		} else if (state === '200') {
			return 'variant-filled-success';
		} else {
			return 'variant-filled-primary';
		}
	}

	function check_token() {
		axios
			.get($data.backend_url + '/check_token', {
				headers: {
					Authorization: `Bearer ${$data.jwt}`
				}
			})
			.then((response) => {
				console.log(response);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function upload_notes() {
		axios
			.post($data.backend_url + '/upload_notes', JSON.stringify($data.notes_unsynced), {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.notes_synced = $data.notes_synced + $data.notes_unsynced;
				localStorage.setItem('notes_synced', $data.notes_synced);
				$data.notes_unsynced = '';
				localStorage.setItem('notes_unsynced', '');
				console.log(response);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function delete_notes() {
		axios
			.post($data.backend_url + '/delete_notes', '', {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.notes_synced = '';
				localStorage.setItem('notes_synced', '');
				$data.notes_unsynced = '';
				localStorage.setItem('notes_unsynced', '');
			})
			.catch((error) => {
				console.error(error);
			});
	}

	import LoginRegisterComponent from './LoginRegisterComponent.svelte';
	import { get } from 'svelte/store';

	check_connection_to_backend();
	check_connection_to_backend_and_mongo();
</script>

<h2 class="h2 mt-12">Developer's playground</h2>
<div class={`card p-6 ${get_style_variant_by_state(backend_status)}`}>
	Connection to backend: {backend_status}
</div>
<div class={`card p-6 ${get_style_variant_by_state(mongo_status)}`}>
	Connection to mongo: {mongo_status}
</div>
<div>
	users: {user_count}
</div>
<button
	class="btn btn-sm variant-filled"
	on:click={() => {
		add_test_user();
	}}>add test user</button
>
<button
	class="btn btn-sm variant-filled"
	on:click={() => {
		check_connection_to_backend();
		check_connection_to_backend_and_mongo();
	}}>reload data</button
>

<LoginRegisterComponent />
{#if $data.jwt}
	<form>
		<button class="btn variant-filled" on:click={check_token}>check token</button>
	</form>
	<div class="card p-4 variant-ghost">
		<pre style="color: green;">{$data.notes_synced.slice(0, -1)}</pre>
		<pre style="color: yellow;">{$data.notes_unsynced.slice(0, -1)}</pre>
	</div>
	<div>
		<button class="btn variant-filled-warning" on:click={upload_notes}>upload notes</button>
		<!-- <button class="btn variant-filled-warning" on:click={()=>{sync_notes($data)}}>sync notes</button> -->
		<button
			class="btn-icon variant-filled-primary"
			on:click={() => {
				$data.notes_synced = '';
				localStorage.setItem('notes_synced', $data.notes_synced);
				$data.notes_unsynced = '';
				localStorage.setItem('notes_unsynced', $data.notes_unsynced);
			}}
		>
			<i class="fa-solid fa-remove" />
		</button>
		<button class="btn variant-filled-primary" on:click={delete_notes}>delete notes</button>
	</div>
	{#if $data.presets.length}
		<div class="card p-4 variant-ghost">
			{#each $data.presets as preset}
				<div>
					{preset.name}
					{preset.last_edited}
					{preset.status}
				</div>
			{/each}
		</div>
	{:else}
		<div class="card mt-12 variant-ghost-warning p-4">
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			You have no presets yet! Create them in the
			<span
				style="cursor: pointer;"
				on:click={() => {
					$data.current_page = 'presets';
					localStorage.setItem('current_page', 'presets');
				}}>"<u>presets</u>"</span
			> tab.
		</div>
	{/if}
	<div>
		<button class="btn variant-filled-success" on:click={data.sync_presets}>sync presets</button>
		<button
			class="btn-icon variant-filled-primary"
			on:click={() => {
				data.update((c)=>{return {...c, presets: []}});
				localStorage.setItem('presets', JSON.stringify(get(data).presets));
			}}
		>
			<i class="fa-solid fa-remove" />
		</button>
	</div>
{/if}
