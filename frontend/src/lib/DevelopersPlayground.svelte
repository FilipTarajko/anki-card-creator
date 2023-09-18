<script lang="ts">
	import axios from 'axios';

	let backend_status = 'loading...';
	let mongo_status = 'loading...';
	let user_count = 'loading...';

	import { data } from '../store';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	function check_connection_to_backend() {
		backend_status = 'loading...';
		user_count = 'loading...';
		axios
			.get('http://localhost:3001/check_backend')
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
			.get('http://localhost:3001/check_mongo')
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
			.post('http://localhost:3001/add_test_user')
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
			.get('http://localhost:3001/check_token', {
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
			.post('http://localhost:3001/upload_notes', JSON.stringify($data.notes_unsynced), {
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

	function sync_notes() {
		axios
			.post('http://localhost:3001/sync_notes', JSON.stringify($data.notes_unsynced), {
				headers: {
					Authorization: `Bearer ${$data.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				$data.notes_synced = response.data;
				localStorage.setItem('notes_synced', $data.notes_synced);
				$data.notes_unsynced = '';
				localStorage.setItem('notes_unsynced', '');
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function delete_notes() {
		axios
			.post('http://localhost:3001/delete_notes', '', {
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

	// function upload_presets() {
	// 	axios
	// 		.post('http://localhost:3001/upload_presets', JSON.stringify($data.presets), {
	// 			headers: {
	// 				Authorization: `Bearer ${$data.jwt}`,
	// 				'Content-Type': 'application/json'
	// 			}
	// 		})
	// 		.then((response) => {
	// 			console.log(response);
	// 			if (response.status === 200) {
	// 				$data.presets.forEach((preset: Preset) => {
	// 					preset.status = 'synced';
	// 				});
	// 				$data.presets = $data.presets;
	// 				localStorage.setItem('presets', JSON.stringify($data.presets));
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			console.error(error);
	// 		});
	// }

	function sync_presets() {
		axios
			.post(
				'http://localhost:3001/sync_presets',
				JSON.stringify([
					$data.presets.filter((e: Preset) => e.status == 'unsynced'),
					$data.presets.filter((e: Preset) => e.status == 'to_update'),
					$data.ids_of_presets_to_remove || []
				]),
				{
					headers: {
						Authorization: `Bearer ${$data.jwt}`,
						'Content-Type': 'application/json'
					}
				}
			)
			.then((response) => {
				console.log(response);
				if (response.status === 200) {
					console.log(response.data[0]);
					let sync_report = response.data[0];
					if (sync_report.ignored_presets.length > 0) {
						show_toast(
							`Some presets were later changed on different device!<br/>${sync_report.ignored_presets.join(
								'<br/>'
							)}`,
							'variant-filled-warning',
							0,
							false
						);
					}
					if (sync_report.unfound_presets.length > 0) {
						show_toast(
							`You had changes to already-deleted presets!<br/>${sync_report.unfound_presets.join(
								'<br/>'
							)}`,
							'variant-filled-warning',
							0,
							false
						);
					}
					if (sync_report.ignored_presets.length == 0 && sync_report.unfound_presets.length == 0) {
						show_toast('Presets synced!', 'variant-filled-success', 1000, true, true);
					}
					$data.presets = response.data[1];
					localStorage.setItem('presets', JSON.stringify($data.presets));
					$data.ids_of_presets_to_remove = [];
					localStorage.setItem('ids_of_presets_to_remove', JSON.stringify([]));
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}

	// function load_presets() {
	// 	axios
	// 		.post('http://localhost:3001/load_presets', '', {
	// 			headers: {
	// 				Authorization: `Bearer ${$data.jwt}`,
	// 				'Content-Type': 'application/json'
	// 			}
	// 		})
	// 		.then((response) => {
	// 			$data.presets = response.data;
	// 			localStorage.setItem('presets', JSON.stringify($data.presets));
	// 			console.log(response.data);
	// 		})
	// 		.catch((error) => {
	// 			console.error(error);
	// 		});
	// }

	import { getToastStore } from '@skeletonlabs/skeleton';
	import LoginRegisterComponent from './LoginRegisterComponent.svelte';

	const toastStore = getToastStore();

	function show_toast(
		message: string,
		background = 'variant-filled-primary',
		timeout = 10000,
		autohide = true,
		hideDismiss = false
	) {
		const t: ToastSettings = {
			message,
			timeout,
			background,
			autohide,
			hideDismiss
		};
		toastStore.trigger(t);
	}

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
		<pre>{$data.notes_synced}</pre>
		-
		<pre>{$data.notes_unsynced}</pre>
		<button class="btn variant-filled-warning" on:click={upload_notes}>upload notes</button>
		<button class="btn variant-filled-warning" on:click={sync_notes}>sync notes</button>
		<button class="btn variant-filled-primary" on:click={delete_notes}>delete notes</button>
	</div>
	<div class="card p-4 variant-ghost" style="line-break: anywhere; width: 80%;">
		{#each $data.presets as preset}
			<div>
				{preset.name}
				{preset.last_edited}
				{preset.status}
			</div>
		{/each}
		<button class="btn variant-filled-success" on:click={sync_presets}>sync presets</button>
	</div>
{/if}
