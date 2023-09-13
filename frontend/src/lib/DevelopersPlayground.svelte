<script lang="ts">
	import axios from 'axios';
	let status = 'loading...';

	function check_connection_to_backend() {
		axios
			.get('http://localhost:3001/check_connection_to_backend')
			.then((response) => {
				if (response.status === 200) {
					status = '200';
				} else {
					status = `${response.status}`;
				}
			})
			.catch((error) => {
				status = error.message;
			});
	}

	check_connection_to_backend();
</script>

<h2 class="h2 mt-12">Developer's playground</h2>
<div class={`card p-6 ${status == '200' ? 'variant-filled-success' : 'variant-filled-primary'}`}>
	Connection to backend: {status}
</div>
<button
	class="btn btn-sm variant-filled"
	on:click={() => {
		check_connection_to_backend();
	}}>test connection to DB</button
>
