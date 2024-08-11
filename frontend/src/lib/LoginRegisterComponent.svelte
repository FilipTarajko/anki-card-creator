<script lang="ts">
	import { data } from '../store';

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
</script>

{#if $data.jwt}
	<div class="card p-6">
		Logged in as {$data.username} ({$data.email})
	</div>
	<button on:click={data.log_out} class="btn variant-filled-primary">log out</button>
{:else}
	<form>
		<div class="card p-6" style="display: flex; flex-direction: column; color: black;">
			<input type="email" placeholder="email" bind:value={registration_form_data.email} />
			<input type="text" placeholder="username" bind:value={registration_form_data.username} />
			<input type="password" placeholder="password" bind:value={registration_form_data.password} />
			<input type="password" placeholder="repeat password" bind:value={password_repeat} />
			<button class="btn btn-sm variant-filled mt-2" on:click={()=>{data.try_to_register(registration_form_data, password_repeat)}}> register </button>
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
			<button class="btn btn-sm variant-filled mt-2" on:click={()=>{data.try_to_login(login_form_data)}}> login </button>
		</div>
	</form>
{/if}
