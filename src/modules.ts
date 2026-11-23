import Core from "./index.js";
import { BaseData } from "./data.js";

import fs from "fs";

export interface ModuleData {
	readonly instance: IModule;
	readonly folder: string;
}

export interface IModule {
	readonly name: string;
	readonly data?: BaseData;
	readonly log?: ReturnType<typeof Core.log.makeFunctions>;

	readonly initializeBefore?: string[];
	readonly initializeAfter?: string[];
	initialize(): Promise<void>;
}

/** key is module name */
export class Modules extends Map<string, ModuleData> {
	getInstance<Module extends IModule>(name: string) {
		const module = this.get(name);
		if (module == null) return module;
		return module.instance as Module;
	}

	setReadonlyFields<Obj extends object, Key extends keyof Obj>(obj: Obj, fields: Pick<Obj, Key>): Obj {
		for (const [key, value] of Object.entries(fields))
			Object.defineProperty(obj, key, {value, writable: true, enumerable: true, configurable: true});
		return obj;
	}

	async load() {
		for (const folder of fs.readdirSync("dist/modules", {withFileTypes: true})) {
			if (fs.existsSync(`src/modules/${folder.name}/disabled`) || fs.existsSync(`dist/modules/${folder.name}/disabled`)) continue;
			try {
				const instance: IModule = (await import(`./modules/${folder.name}/index.js`)).default;
				this.set(instance.name, {instance, folder: folder.name});
			} catch(error) {
				Core.log.error(`Loading module in folder "${folder.name}" failed`, {error, args: {triedToRun: `import(./dist/modules/${folder.name}/index.js)`}});
				continue;
			}
		}
	}

	async initialize() {
		const executeOrder67 = (() => {
			const names = Array.from(this.keys());
			const originalIndex = new Map(names.map((n, i) => [n, i]));

			const next = new Map<string, Set<string>>(names.map(n => [n, new Set<string>()]));
			const indegree = new Map<string, number>(names.map(n => [n, 0]));

			const link = (from: string, to: string) => {
				if (from === to || !next.has(from) || !next.has(to)) return;
				const set = next.get(from)!;
				if (set.has(to)) return;
				set.add(to);
				indegree.set(to, indegree.get(to)! + 1);
			};

			for (const name of names) {
				const instance = this.get(name)!.instance;
				if (instance.initializeAfter != null) for (const query of instance.initializeAfter) link(query, name);
				if (instance.initializeBefore != null) for (const query of instance.initializeBefore) link(name, query);
			}

			const ready = names.filter(n => indegree.get(n) === 0);
			const result: string[] = [];

			while (ready.length > 0) {
				ready.sort((a, b) => originalIndex.get(a)! - originalIndex.get(b)!);
				const name = ready.shift()!;
				result.push(name);

				for (const dep of next.get(name)!) {
					const left = indegree.get(dep)! - 1;
					indegree.set(dep, left);
					if (left === 0) ready.push(dep);
				}
			}

			if (result.length !== names.length) {
				const stuck = names.filter(n => indegree.get(n)! > 0);
				Core.log.fatal(`Cyclic dependency detected, please check initializeBefore and initializeAfter fields of module${stuck.length > 1 ? "s" : ""}: ${stuck.join(", ")}`);
			}

			return result;
		})();

		for (const name of executeOrder67) {
			const instance = this.get(name)!.instance;
			try {
				await instance.initialize();
			} catch(error) {
				Core.log.error(`Initializing module "${name}" failed`, {error});
				this.delete(name);
			}
		}

		if (executeOrder67.length > 0)
			Core.log.info(`${executeOrder67.length} modules loaded: ${executeOrder67.join(", ")}`);
	}
}
export default new Modules();