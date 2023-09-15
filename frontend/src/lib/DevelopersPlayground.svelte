<script lang="ts">
	import axios from 'axios';
	import jwt_decode from 'jwt-decode';

	let backend_status = 'loading...';
	let mongo_status = 'loading...';
	let user_count = 'loading...';

	let registration_form_data = {
		email: 'test@test.pl',
		username: 'test',
		password: 'testtest'
	};
	let password_repeat = 'testtest';

	import { data } from '../store';

	let login_form_data = {
		username_or_email: 'test',
		password: 'testtest'
	};

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

	function try_to_register() {
		if (registration_form_data.password !== password_repeat) {
			alert('passwords do not match');
			return;
		}
		axios
			.post('http://localhost:3001/register_user', registration_form_data)
			.then((response) => {
				console.log(response);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function try_to_login() {
		axios
			.post('http://localhost:3001/login', login_form_data)
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

{#if $data.jwt}
	<div class="card p-6">
		Logged in as {$data.username} ({$data.email}), id: {$data.id}
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
		class="btn variant-filled">log out</button
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
