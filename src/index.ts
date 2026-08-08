import FilesController from "./files.js";
import * as LogController from "./log.js";
import ModulesController from "./modules.js";
import * as TasksController from "./tasks.js";
import TerminalCommands from "./terminal-commands/index.js";

import hD from "humanize-duration";
import { EventEmitter } from "node:events";

interface CoreEvents {
	/**
	 * Calls on fully initialized system
	 * 
	 * TIP: constructor of modules calls before running terminal commands
	 */
	initialized: () => void;
}

export class Core extends EventEmitter {
	readonly name = "core" as const;
	readonly version = "";
	readonly directory = (() => {
		let directory = import.meta.dirname.replaceAll("\\", "/");
		directory = directory.substring(0, directory.lastIndexOf("/"));
		return directory;
	})();

	readonly fs = FilesController;
	readonly log = LogController;
	readonly modules = ModulesController;
	readonly tasks = TasksController;

	humanizeDuration(n: number) {
		return hD(n, {language: "ru", units: ["d", "h", "m", "s", "ms"]});
	}

	async initialize() {
		this.log.initialize();
		this.log.info(`Running version ${this.version}`);

		await this.modules.initialize();

		if (await TerminalCommands.run())
			return;

		this.log.releaseStoppedTerminalOutput();
		this.emit("initialized");
	}

	override once<EventName extends keyof CoreEvents>(eventName: EventName, listener: CoreEvents[EventName]) {
		return super.once(eventName, listener);
	}
	override prependOnceListener<EventName extends keyof CoreEvents>(eventName: EventName, listener: CoreEvents[EventName]) {
		return super.prependOnceListener(eventName, listener);
	}
	override on<EventName extends keyof CoreEvents>(eventName: EventName, listener: CoreEvents[EventName]) {
		return super.on(eventName, listener);
	}
	override prependListener<EventName extends keyof CoreEvents>(eventName: EventName, listener: CoreEvents[EventName]) {
		return super.prependListener(eventName, listener);
	}
	override off<EventName extends keyof CoreEvents>(eventName: EventName, listener: CoreEvents[EventName]) {
		return super.off(eventName, listener);
	}
	override emit<EventName extends keyof CoreEvents>(eventName: EventName, ...args: Parameters<CoreEvents[EventName]>) {
		return super.emit(eventName, ...args);
	}
}
export default new Core();

export * from "./data.js";
export * from "./modules.js";