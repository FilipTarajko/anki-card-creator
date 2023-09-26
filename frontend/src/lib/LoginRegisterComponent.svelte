<script lang="ts">
	import { data } from '../store';
	import jwt_decode from 'jwt-decode';
	import axios from 'axios';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let login_form_data = {
		username_or_email: 'test',
		password: 'testtest'
	};

	let registration_form_data = {
		email: 'test@test.pl',
		username: 'test',
		password: 'testtest'
	};
	let password_repeat = 'testtest';

	function try_to_register() {
		if (registration_form_data.password !== password_repeat) {
			alert('passwords do not match');
			return;
		}
		axios
			.post($data.backend_url + '/register_user', registration_form_data)
			.then((response) => {
				console.log(response);
				console.log(response.data);
				if (response.data === 'Registered') {
					const t: ToastSettings = {
						message: 'Registered successfully! You can now log in.',
						timeout: 5000,
						background: 'variant-filled-success',
						autohide: true,
						hideDismiss: false
					};
					toastStore.trigger(t);
				}
			})
			.catch((error) => {
				console.error(error);
				let explanation =
					error.response.statusText == 'Bad Request' ? 'your data is invalid!' : 'internal error!';
				const t: ToastSettings = {
					message: `Registration failed: ${explanation}`,
					timeout: 10000,
					background: 'variant-filled-primary',
					autohide: true,
					hideDismiss: false
				};
				toastStore.trigger(t);
			});
	}

	function try_to_login() {
		axios
			.post($data.backend_url + '/login', login_form_data)
			.then((response) => {
				console.log(response);
				$data.jwt = response.data;
				let decoded: any = jwt_decode(response.data);
				$data.username = decoded?.sub || '';
				$data.email = decoded?.email || '';
				$data.id = decoded?.id || '';
				localStorage.setItem('jwt', $data.jwt);
				localStorage.setItem('username', $data.username);
				localStorage.setItem('email', $data.email);
				localStorage.setItem('id', $data.id);
			})
			.catch((error) => {
				console.error(error);
				if (error.response.status === 400) {
					alert('wrong username or password');
				}
			});
	}
</script>

{#if $data.jwt}
	<div class="card p-6">
		Logged in as {$data.username} ({$data.email})
	</div>
	<button
		on:click={() => {
			$data.jwt = '';
			$data.username = '';
			$data.email = '';
			$data.id = '';
			localStorage.removeItem('jwt');
			localStorage.removeItem('username');
			localStorage.removeItem('email');
			localStorage.removeItem('id');
		}}
		class="btn variant-filled-primary">log out</button
	>
{:else}
	<form>
		<div class="card p-6" style="display: flex; flex-direction: column; color: black;">
			<input type="email" placeholder="email" bind:value={registration_form_data.email} />
			<input type="text" placeholder="username" bind:value={registration_form_data.username} />
			<input type="password" placeholder="password" bind:value={registration_form_data.password} />
			<input type="password" placeholder="repeat password" bind:value={password_repeat} />
			<button class="btn btn-sm variant-filled mt-2" on:click={try_to_register}> register </button>
		</div>
	</form>

	<form>
		<div class="card p-6" style="display: flex; flex-direction: column; color: black;">
			<input
				type="text"
				placeholder="username_or_email"
				bind:value={login_form_data.username_or_email}
			/>
			<input type="password" placeholder="password" bind:value={login_form_data.password} />
			<button class="btn btn-sm variant-filled mt-2" on:click={try_to_login}> login </button>
		</div>
	</form>
{/if}
