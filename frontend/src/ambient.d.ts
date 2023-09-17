type Field = {
	id: number;
	name: string;
	type: 'text' | 'selectOne' | 'selectMany';
	options: string[];
	default: string[];
	current_inputs: string[];
	visible_by_default: boolean;
	currently_visible?: boolean;
	currently_frozen?: boolean;
};

type Preset = {
	id?: number;
	last_edited: number;
	name: string;
	fields: Field[];
};
