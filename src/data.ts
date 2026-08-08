import Core from "./index.js";
import { type IModule } from "./modules.js";

export type DataSaveValue = Record<string, any> | any[] | number | string | boolean | null | undefined;

export class BaseData {
	protected module: IModule;
	readonly filePath: string;
	protected saveFields: Map<string, () => Promise<any>> = new Map();

	constructor(module: IModule) {
		this.module = module;
	}

	protected getSavedFields(): DataSaveValue {
		(this.filePath as any) = `${this.module.name}/data.json`;
		return Core.fs.exists(this.filePath) ? JSON.parse(Core.fs.read(this.filePath).toString()) : undefined;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected registerFieldString(json: DataSaveValue, name: string, fromSave?: (savedValue: string) => void, toSave?: () => string) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (typeof json?.[name] === "string") {
			if (fromSave) fromSave(json[name]);
			else (this as any)[name] = json[name];
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected async registerFieldStringAsync(json: DataSaveValue, name: string, fromSave?: (savedValue: string) => Promise<void>, toSave?: () => Promise<string>) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (typeof json?.[name] === "string") {
			if (fromSave) await fromSave(json[name]);
			else (this as any)[name] = json[name];
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected registerFieldNumber(json: DataSaveValue, name: string, fromSave?: (savedValue: number) => void, toSave?: () => number) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (typeof json?.[name] === "number") {
			if (fromSave) fromSave(json[name]);
			else (this as any)[name] = json[name];
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected async registerFieldNumberAsync(json: DataSaveValue, name: string, fromSave?: (savedValue: number) => Promise<void>, toSave?: () => Promise<number>) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (typeof json?.[name] === "number") {
			if (fromSave) await fromSave(json[name]);
			else (this as any)[name] = json[name];
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected registerFieldBoolean(json: DataSaveValue, name: string, fromSave?: (savedValue: boolean) => void, toSave?: () => boolean) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (typeof json?.[name] === "boolean") {
			if (fromSave) fromSave(json[name]);
			else (this as any)[name] = json[name];
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected async registerFieldBooleanAsync(json: DataSaveValue, name: string, fromSave?: (savedValue: boolean) => Promise<void>, toSave?: () => Promise<boolean>) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (typeof json?.[name] === "boolean") {
			if (fromSave) await fromSave(json[name]);
			else (this as any)[name] = json[name];
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected registerFieldArray(json: DataSaveValue, name: string, fromSave?: (savedValue: any[]) => void, toSave?: () => any[]) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (Array.isArray(json[name])) {
			if (fromSave) fromSave(json[name]);
			else (this as any)[name].push(...json[name]);
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected async registerFieldArrayAsync(json: DataSaveValue, name: string, fromSave?: (savedValue: any[]) => Promise<void>, toSave?: () => Promise<any[]>) {
		this.saveFields.set(name, toSave ? toSave : () => (this as any)[name]);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (Array.isArray(json[name])) {
			if (fromSave) await fromSave(json[name]);
			else (this as any)[name].push(...json[name]);
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected registerFieldMap(json: DataSaveValue, name: string, fromSave?: (savedValue: Record<string, any>) => void, toSave?: () => Record<string, any>) {
		this.saveFields.set(name, toSave ? toSave : (() => {
			const save: Record<string, any> = {};
			for (const [k, v] of (this as any)[name].entries()) {
				save[k] = v;
			}
			return save;
		}) as any);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (this.isRecord(json[name])) {
			if (fromSave) fromSave(json[name]);
			else Object.entries(json[name]).forEach(([k, v]) => (this as any)[name].set(k, v));
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected async registerFieldMapAsync(json: DataSaveValue, name: string, fromSave?: (savedValue: Record<string, any>) => Promise<void>, toSave?: () => Promise<Record<string, any>>) {
		this.saveFields.set(name, toSave ? toSave : (() => {
			const save: Record<string, any> = {};
			for (const [k, v] of (this as any)[name].entries()) {
				save[k] = v;
			}
			return save;
		}) as any);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		if (this.isRecord(json[name])) {
			if (fromSave) await fromSave(json[name]);
			else Object.entries(json[name]).forEach(([k, v]) => (this as any)[name].set(k, v));
			return true;
		}
		else
			return false;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected registerFieldAny(json: DataSaveValue, name: string, fromSave: (savedValue: DataSaveValue) => void, toSave: () => DataSaveValue) {
		this.saveFields.set(name, toSave as any);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		fromSave(json[name]);
		return true;
	}

	/** @returns If `true`, field was got and successfully validated */
	protected async registerFieldAnyAsync(json: DataSaveValue, name: string, fromSave: (savedValue: DataSaveValue) => Promise<void>, toSave: () => Promise<DataSaveValue>) {
		this.saveFields.set(name, toSave);

		if (json == null || !(typeof json === "object" && !Array.isArray(json)))
			return false;
		await fromSave(json[name]);
		return true;
	}

	protected isRecord<Value>(obj: unknown): obj is Record<string, Value> {
		return obj != null && typeof obj === "object" && !Array.isArray(obj);
	}

	save() {
		this.saveAsync();
	}
	async saveAsync() {
		const json: any = {};
		for (const [field, getter] of this.saveFields)
			json[field] = await getter();
		Core.fs.write(this.filePath, JSON.stringify(json));
	}
}