export type Field = {
	id: number;
	name: string;
	type: 'text' | 'selectOne' | 'selectMany' | 'bound';
	options: string[];
	default: string[];
	current_inputs: string[];
	visible_by_default: boolean;
	frozen_by_default: boolean;
	expanded_in_editor?: boolean;
	currently_visible?: boolean;
	currently_frozen?: boolean;
	bound_to?: number;
	bindings?: string[][];
	binding_type?: BindingType;
};

export type Preset = {
	_id?: any;
	last_edited: number;
	name: string;
	fields: Field[];
	status: 'synced' | 'unsynced' | 'to_update';
	hue: string;
	iframes?: [string, string][];
};

export enum BindingType {
	EQUALS = 'equals',
	CONTAINS = 'contains',
	STARTS = 'starts',
	ENDS = 'ends',
	REGEX = 'regex',
};
