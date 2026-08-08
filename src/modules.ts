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
}

/** key is module name */
export class Modules extends Map<string, ModuleData> {
	async initialize() {
		let infoMessage = " modules initialized: ";

		let count = 0;
		for (const folder of fs.readdirSync("dist/modules", {withFileTypes: true})) {
			if (fs.existsSync(`src/modules/${folder.name}/disabled`) || fs.existsSync(`dist/modules/${folder.name}/disabled`)) continue;
			try {
				const instance: IModule = (await import(`./modules/${folder.name}/index.js`)).default;
				this.set(instance.name, {instance, folder: folder.name});
				infoMessage += `${instance.name}, `;
				count++;
			} catch(error) {
				Core.log.error(`Initializing module in folder ${folder.name} failed`, {error, args: {triedToRun: `import(./dist/modules/${folder.name}/index.js)`}});
				continue;
			}
		}

		if (count > 0)
			Core.log.info(count + infoMessage.substring(0, infoMessage.length - 2));
	}
}
export default new Modules();