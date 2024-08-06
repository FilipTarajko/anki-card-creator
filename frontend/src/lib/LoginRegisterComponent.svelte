<script lang="ts">
	import { data } from '../store';
	import jwt_decode from 'jwt-decode';
	import axios from 'axios';

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
			data.showErrorToast('Passwords do not match!');
			return;
		}
		axios
			.post($data.backend_url + '/register_user', registration_form_data)
			.then((response) => {
				if (response.data === 'Registered') {
					data.showSuccessToast('Registered successfully! You can now log in.');
				}
			})
			.catch((error) => {
				data.showErrorToast(`Registration failed: ${error?.response?.data || 'no connection'}`);
			});
	}

	function try_to_login() {
		axios
			.post($data.backend_url + '/login', login_form_data)
			.then((response) => {
				$data.jwt = response.data;
				let decoded: any = jwt_decode(response.data);
				$data.username = decoded?.sub || '';
				$data.email = decoded?.email || '';
				$data.id = decoded?.id || '';
				localStorage.setItem('jwt', $data.jwt);
				localStorage.setItem('username', $data.username);
				localStorage.setItem('email', $data.email);
				localStorage.setItem('id', $data.id);

				data.showSuccessToast('Logged in successfully!');
			})
			.catch((error) => {
				data.showErrorToast(`Log-in failed: ${error?.response?.data || 'no connection'}`);
			});
	}

	function log_out() {
		$data.jwt = '';
		$data.username = '';
		$data.email = '';
		$data.id = '';
		localStorage.removeItem('jwt');
		localStorage.removeItem('username');
		localStorage.removeItem('email');
		localStorage.removeItem('id');

		data.showSuccessToast('Logged out successfully!');
	}
</script>

{#if $data.jwt}
	<div class="card p-6">
		Logged in as {$data.username} ({$data.email})
	</div>
	<button on:click={log_out} class="btn variant-filled-primary">log out</button>
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
