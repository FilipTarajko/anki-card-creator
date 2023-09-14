<script lang="ts">
	import axios from 'axios';
	let backend_status = 'loading...';
	let mongo_status = 'loading...';
	let user_count = 'loading...';

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
