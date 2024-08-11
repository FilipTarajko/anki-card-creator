import { get, writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { NoteAddingMode, type Field, type Preset } from './types';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import {default as default_fields} from './default_fields.json';

function createData(){
	const data: Writable<{
		backend_url: string
		notes_synced: string
		notes_unsynced: string
		presets: Preset[]
		ids_of_presets_to_remove: number[]
		prefix_for_exports: string
		current_page: string
		jwt: string
		username: string
		email: string
		id: string
		display_csv_headers: boolean
		duplicate_checking_values_synced: string[]
		duplicate_checking_values_unsynced: string[]
		note_export_columns_for_duplicate_checking: number[]
		preset_fields_for_duplicate_checking_offset: number
		duplicate_checking_removed_needles: (string|RegExp)[]
		current_preset_for_notes: Preset
		currently_all_forced_visible: boolean
		isSidebarShownOnNarrow: boolean
		toastStore: any
		noteAddingMode: NoteAddingMode | string | boolean // TODO
		currentlyWrittenPrompt: string
		currentlyWrittenPromptList: string
		currentPromptListSeparator: string
		prompts_unsynced: string[]
		prompts_synced: string[]
		prompts_deleted: string[]
		current_prompt: string
		shouldKeepPrompt: boolean
		promptedFieldIndex: number
		fields: Field[]
		selected_preset: Preset | null
	}> = writable({
		backend_url: PUBLIC_BACKEND_URL,
		notes_synced: (browser && window.localStorage.getItem('notes_synced')) || '',
		notes_unsynced: (browser && window.localStorage.getItem('notes_unsynced')) || '',
		presets: (browser && JSON.parse(window.localStorage.getItem('presets') ?? '[]')) || [],
		ids_of_presets_to_remove:
			(browser && JSON.parse(window.localStorage.getItem('ids_of_presets_to_remove') ?? '[]')) || [],
		prefix_for_exports: `#separator:Semicolon\n#deck column:1\n#notetype column:2\n#tags column:3\n`,
		current_page: (browser && window.localStorage.getItem('current_page')) || 'about',
		jwt: (browser && window.localStorage.getItem('jwt')) || '',
		username: (browser && window.localStorage.getItem('username')) || '',
		email: (browser && window.localStorage.getItem('email')) || '',
		id: (browser && window.localStorage.getItem('id')) || '',
		display_csv_headers:
			(browser && JSON.parse(window.localStorage.getItem('display_csv_headers') ?? 'false')) || false,
		duplicate_checking_values_synced: (browser && JSON.parse(window.localStorage.getItem('duplicate_checking_values_synced') ?? '[]')) ?? [],
		duplicate_checking_values_unsynced: (browser && JSON.parse(window.localStorage.getItem('duplicate_checking_values_unsynced') ?? '[]')) ?? [],
		note_export_columns_for_duplicate_checking: (browser && JSON.parse(window.localStorage.getItem('note_export_columns_for_duplicate_checking') ?? 'false')) || [0, 1],
		preset_fields_for_duplicate_checking_offset: 3,
		duplicate_checking_removed_needles: [/^(de)\s/, /^(het)\s/, /^.$/, /^de\/het\s/, /^the\s/],
		current_preset_for_notes: (browser && JSON.parse(window.localStorage.getItem('current_preset_for_notes') ?? 'false')),
		currently_all_forced_visible: (browser && JSON.parse(window.localStorage.getItem('currently_all_forced_visible') ?? 'false')),
		isSidebarShownOnNarrow: (browser && JSON.parse(window.localStorage.getItem('isSidebarShownOnNarrow') ?? 'true' )),
		toastStore: null,
		noteAddingMode: (browser && window.localStorage.getItem('noteAddingMode')) ?? NoteAddingMode.FROM_SCRATCH,
		currentlyWrittenPrompt: (browser && window.localStorage.getItem('currentlyWrittenPrompt')) || '',
		currentlyWrittenPromptList: (browser && window.localStorage.getItem('currentlyWrittenPromptList')) || '',
		currentPromptListSeparator: (browser && window.localStorage.getItem('currentPromptListSeparator')) || '',
		prompts_unsynced: (browser && JSON.parse(window.localStorage.getItem('prompts_unsynced') ?? '[]')) ?? [],
		prompts_synced: (browser && JSON.parse(window.localStorage.getItem('prompts_synced') ?? '[]')) ?? [],
		prompts_deleted: (browser && JSON.parse(window.localStorage.getItem('prompts_deleted') ?? '[]')) ?? [],
		current_prompt: (browser && JSON.parse(window.localStorage.getItem("current_prompt") ?? '""')) ?? '',
		shouldKeepPrompt: (browser && JSON.parse(window.localStorage.getItem('shouldKeepPrompt') ?? 'true')),
		promptedFieldIndex: 3,
		fields: JSON.parse(JSON.stringify(default_fields)),
		selected_preset: null,
	});
	const { subscribe, set, update } = data;

	function handleNoJWT() {
		if (!get(data).jwt) {
			showErrorToast('Please log in before syncing!',
				{
					label: 'Go to login page',
					response: ()=>{data.update((c)=>{
						localStorage.setItem('current_page', 'account');
						return {
							...c,
							current_page: 'account'
						}
					})}
				}
			);
			return true;
		}
		return false;
	}

	function sync_all() {
		if (handleNoJWT()) {
			return;
		}
		sync_presets();
		sync_unique_questions();
		sync_prompts();
		sync_notes();
	}

	function sync_notes() {
		if (handleNoJWT()) {
			return;
		}
		const currentData = get(data);
		axios
			.post(currentData.backend_url + '/sync_notes', JSON.stringify(currentData.notes_unsynced), {
				headers: {
					Authorization: `Bearer ${currentData.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				update((n)=>{return {...n, notes_synced: response.data, notes_unsynced: ''}})
				localStorage.setItem('notes_unsynced', '');
				localStorage.setItem('notes_synced', response.data);
				showSuccessToast('Notes synced!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast('Notes sync failed!');
			});
	}

	function sync_prompts() {
		if (handleNoJWT()) {
			return;
		}
		let currentData = get(data);
		const requestPayload = JSON.stringify([
			currentData.prompts_unsynced,
			currentData.prompts_deleted,
		]);
		axios
			.post(currentData.backend_url + '/sync_prompts', requestPayload, {
				headers: {
					Authorization: `Bearer ${currentData.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				update((c)=>{return {...c, prompts_synced: response.data, prompts_unsynced: [], prompts_deleted: []}});
				localStorage.setItem('prompts_synced', JSON.stringify(response.data));
				localStorage.setItem('prompts_unsynced', '[]');
				localStorage.setItem('prompts_deleted', '[]');

				currentData = get(data);
				update((c)=>{return {...c, current_prompt: getFirstPrompt()}});
				localStorage.setItem('current_prompt', JSON.stringify(currentData.current_prompt));
				if (currentData.noteAddingMode === NoteAddingMode.FROM_PROMPT) {
					console.log("setting an input to current_prompt")
						// @ts-ignore
						update((c)=>{
						let new_current_prompt = structuredClone(c.current_preset_for_notes);
						new_current_prompt.fields[currentData.promptedFieldIndex].current_inputs[0] = currentData.current_prompt;
						return {...c, current_prompt: new_current_prompt};
					});
					currentData
				}
				showSuccessToast("Synced prompts");
			})
			.catch((error) => {
				console.error(error);
				showErrorToast("Prompts sync failed!");
			});
	}

	function delete_prompts() {
		if (handleNoJWT()) {
			return;
		}
		const currentData = get(data);
		axios
			.post(currentData.backend_url + '/delete_prompts', '', {
				headers: {
					Authorization: `Bearer ${currentData.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				data.update((c) => {return {...c, prompts_unsynced: [], prompts_synced: [], prompts_deleted: []}});
				localStorage.setItem("prompts_unsynced", JSON.stringify([]));
				localStorage.setItem("prompts_synced", JSON.stringify([]));
				localStorage.setItem("prompts_deleted", JSON.stringify([]));
				showSuccessToast('All prompts deleted!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast('Deleting all prompts failed!');
			});
	}

	function sync_unique_questions() {
		if (handleNoJWT()) {
			return;
		}
		let currentData = get(data);
		axios
			.post(currentData.backend_url + '/sync_unique_questions', JSON.stringify(currentData.duplicate_checking_values_unsynced ?? []), {
				headers: {
					Authorization: `Bearer ${currentData.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				update((c)=>{return {...c, duplicate_checking_values_synced: response.data, duplicate_checking_values_unsynced: []}})
				localStorage.setItem('duplicate_checking_values_synced', JSON.stringify(response.data));
				localStorage.setItem('duplicate_checking_values_unsynced', '[]');
				showSuccessToast("Synced unique question list");
			})
			.catch((error) => {
				console.error(error);
				showErrorToast("Unique question list sync failed!");
			});
	}



	function sync_presets() {
		if (handleNoJWT()) {
			return;
		}
		let currentData = get(data);
		axios
			.post(
				currentData.backend_url + '/sync_presets',
				JSON.stringify([
					currentData.presets.filter((e: Preset) => e.status == 'unsynced'),
					currentData.presets.filter((e: Preset) => e.status == 'to_update'),
					currentData.ids_of_presets_to_remove || []
				]),
				{
					headers: {
						Authorization: `Bearer ${currentData.jwt}`,
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
						showWarningToast(
							`Some presets were later changed on different device!<br/>${sync_report.ignored_presets.join(
								'<br/>'
							)}`
						);
					}
					if (sync_report.unfound_presets.length > 0) {
						showWarningToast(
							`You had changes to already-deleted presets!<br/>${sync_report.unfound_presets.join(
								'<br/>'
							)}`
						);
					}
					if (sync_report.ignored_presets.length == 0 && sync_report.unfound_presets.length == 0) {
						showSuccessToast('Presets synced!');
					}
					update((c)=>{return {...c, presets: response.data[1], ids_of_presets_to_remove: [], fields: JSON.parse(JSON.stringify(default_fields)), selected_preset: null}})
					localStorage.setItem('presets', JSON.stringify(response.data[1]));
					localStorage.setItem('ids_of_presets_to_remove', JSON.stringify([]));
				}
			})
			.catch((error) => {
				console.error(error);
				showErrorToast('Presets sync failed!');
			});
	}

	function try_to_register(registration_form_data: {email: string, username: string, password: string}, password_repeat: string) {
		if (registration_form_data.password !== password_repeat) {
			showErrorToast('Passwords do not match!');
			return;
		}
		axios
			.post(get(data).backend_url + '/register_user', registration_form_data)
			.then((response) => {
				if (response.data === 'Registered') {
					showSuccessToast('Registered successfully! You can now log in.');
				}
			})
			.catch((error) => {
				showErrorToast(`Registration failed: ${error?.response?.data || 'no connection'}`);
			});
	}

	function try_to_login(login_form_data: {username_or_email: string, password: string}) {
		axios
			.post(get(data).backend_url + '/login', login_form_data)
			.then((response) => {
				data.update((c)=>{return{
					...c,
					jwt: response.data,
					username: decoded?.sub || '',
					email: decoded?.email || '',
					id: decoded?.id || '',
				}})
				let decoded: any = jwt_decode(response.data);
				localStorage.setItem('jwt', response.data);
				localStorage.setItem('username', decoded?.sub || '');
				localStorage.setItem('email', decoded?.email || '');
				localStorage.setItem('id', decoded?.id || '');

				showSuccessToast('Logged in successfully!');
			})
			.catch((error) => {
				showErrorToast(`Log-in failed: ${error?.response?.data || 'no connection'}`);
			});
	}

	function log_out() {
		data.update((c)=>{return {...c, jwt: '', username: '', email: '', id: ''}})
		localStorage.removeItem('jwt');
		localStorage.removeItem('username');
		localStorage.removeItem('email');
		localStorage.removeItem('id');

		showSuccessToast('Logged out successfully!');
	}

	function upload_notes() {
		if (handleNoJWT()) {
			return;
		}
		let currentData = get(data);
		axios
			.post(currentData.backend_url + '/upload_notes', JSON.stringify(currentData.notes_unsynced), {
				headers: {
					Authorization: `Bearer ${currentData.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				data.update((c)=>{return {...c, notes_synced: currentData.notes_synced+currentData.notes_unsynced, notes_unsynced: ''}})
				localStorage.setItem('notes_synced', currentData.notes_synced+currentData.notes_unsynced);
				localStorage.setItem('notes_unsynced', '');
				console.log(response);
				showSuccessToast('Notes uploaded!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast('Notes upload failed!');
			});
	}

	function delete_notes() {
		if (handleNoJWT()) {
			return;
		}
		let currentData = get(data);
		axios
			.post(currentData.backend_url + '/delete_notes', '', {
				headers: {
					Authorization: `Bearer ${currentData.jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				data.update((c)=>{return {...c, notes_synced: '', notes_unsynced: ''}})
				localStorage.setItem('notes_synced', '');
				localStorage.setItem('notes_unsynced', '');
				showSuccessToast('Local and cloud notes deleted!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast('Notes deletion failed!');
			});
	}

	function deleteAllUniquenessEntries() {
		axios
			.post(get(data).backend_url + '/delete_unique_questions', '', {
				headers: {
					Authorization: `Bearer ${get(data).jwt}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				data.update((c)=>{return{...c, duplicate_checking_values_synced: [], duplicate_checking_values_unsynced: []}})
				localStorage.setItem("duplicate_checking_values_synced", JSON.stringify([]));
				localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify([]));
				showSuccessToast('Unique question list deleted!');
			})
			.catch((error) => {
				console.error(error);
				showErrorToast('Deleting unique question list failed!');
			});
	}

	function deleteLocalUniquenessEntries() {
		data.update((c)=>{return{...c, duplicate_checking_values_unsynced: []}})
		localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify([]));
		showSuccessToast("Deleted unsynced unique questions list");
	}

	function showToast(message: string, background: string, action?: {label: string, response: Function}) {
		get(data).toastStore.trigger({
			message,
			background,
			timeout: 5000,
			autohide: true,
			hideDismiss: false,
			action: action,
		})
	}

	function showSuccessToast(message: string) {
		showToast(message, 'variant-filled-success');
	}

	function showErrorToast(message: string, action?: {label: string, response: Function}) {
		showToast(message, 'variant-filled-primary', action);
	}

	function showWarningToast(message: string) {
		showToast(message, 'variant-filled-warning');
	}

	function transformTextForDuplicateCheck(text: string) {
		text = text.toLowerCase();
		get(data).duplicate_checking_removed_needles.forEach(needle=>{
			if (needle instanceof RegExp && !needle.global) {
				text = text.replace(needle, "")
			} else {
				text = text.replaceAll(needle, "");
			}
		})
		return text;
	}

	function appendToDuplicateCheckingValuesUnsynced(values: string[]) {
		for (let i=0; i<values.length; i++) {
			const val = transformTextForDuplicateCheck(values[i]);
			if (!val || get(data).duplicate_checking_values_unsynced.includes(val)) {
				continue;
			}
			data.update((c)=>{
				const new_duplicate_checking_values_unsynced = c.duplicate_checking_values_unsynced;
				new_duplicate_checking_values_unsynced.push(val);
				return {...c, duplicate_checking_values_unsynced: new_duplicate_checking_values_unsynced};
			})
		}
		localStorage.setItem("duplicate_checking_values_unsynced", JSON.stringify(get(data).duplicate_checking_values_unsynced));
	}

	function getFirstPrompt(){
		const currentData = get(data);
		if (currentData.current_prompt && (currentData.prompts_synced.includes(currentData.current_prompt) || currentData.prompts_unsynced.includes(currentData.current_prompt))) {
			return currentData.current_prompt;
		}
		return currentData.prompts_synced[0] ?? currentData.prompts_unsynced[0] ?? '';
	}

	return {
		set,
		data,
		update,
		subscribe,
		sync_notes,
		sync_prompts,
		sync_unique_questions,
		sync_presets,
		sync_all,
		showSuccessToast,
		showErrorToast,
		showWarningToast,
		transformTextForDuplicateCheck,
		appendToDuplicateCheckingValuesUnsynced,
		getFirstPrompt,
		delete_prompts,
		upload_notes,
		delete_notes,
		try_to_register,
		try_to_login,
		log_out,
		deleteAllUniquenessEntries,
		deleteLocalUniquenessEntries,
		default_fields,
	}
}

export const data = createData();
