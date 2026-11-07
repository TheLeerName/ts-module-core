import Core from "./index.js";
import { BaseData } from "./data.js";

import fs from "fs";

export interface ModuleData {
	readonly instance: IModule;
	readonly folder: string;
}

export interface IModule {
	readonly name: string;
	readonly data: BaseData;
	readonly log: ReturnType<typeof Core.log.makeFunctions>;

	isDisabled?: () => boolean;
}

/** key is module name */
export class Modules extends Map<string, ModuleData> {
	async initialize() {
		const moduleNames: string[] = [];
		const moduleDisabledNames: string[] = [];

		for (const folder of fs.readdirSync("dist/modules", {withFileTypes: true})) {
			if (fs.existsSync(`src/modules/${folder.name}/disabled`) || fs.existsSync(`dist/modules/${folder.name}/disabled`)) continue;
			try {
				const instance: IModule = (await import(`./modules/${folder.name}/index.js`)).default;
				if (instance.isDisabled?.()) {
					moduleDisabledNames.push(instance.name);
					continue;
				}
				this.set(instance.name, {instance, folder: folder.name});
				moduleNames.push(instance.name);
			} catch(error) {
				Core.log.error(`Initializing module in folder ${folder.name} failed`, {error, args: {triedToRun: `import(./dist/modules/${folder.name}/index.js)`}});
				continue;
			}
		}

		if (moduleNames.length > 0)
			Core.log.info(`${moduleNames.length} modules loaded: ${moduleNames.join(", ")}`);
		if (moduleDisabledNames.length > 0)
			Core.log.warn(`${moduleDisabledNames.length} modules weren't loaded: ${moduleDisabledNames.join(", ")}`);
	}
}
export default new Modules();