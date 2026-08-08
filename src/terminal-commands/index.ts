import readline, { type ReadLineOptions } from "node:readline";

export interface ReadlineInterfaceAdvanced extends readline.Interface {
	questionAsync: (query: string) => Promise<string>;
}
export namespace ReadlineInterfaceAdvanced {
	/**
	 * @param options.input If `undefined` will use `process.stdin`
	 * @param options.output If `undefined`, will use `process.stdout`
	 */
	export function create(options?: Partial<ReadLineOptions>) {
		options ??= {};
		options.input ??= process.stdin;
		options.output ??= process.stdout;
		const rl = readline.createInterface(options as any);
		(rl as ReadlineInterfaceAdvanced).questionAsync = async(query: string) => await new Promise<string>(resolve => rl.question(query, answer => resolve(answer)));
		return rl as ReadlineInterfaceAdvanced;
	}
}

export type TerminalCommandOptions = TerminalCommandOptions.Default | TerminalCommandOptions.WithReadlineInterface;
export namespace TerminalCommandOptions {
	export interface Default {
		type: "DEFAULT";
		callback: (args: string[]) => Promise<boolean>;
	}
	export function isDefault(callback: TerminalCommandOptions): callback is TerminalCommandOptions.Default {
		return callback.type === "DEFAULT";
	}

	export interface WithReadlineInterface {
		type: "WITH_READLINE_INTERFACE";
		callback: (args: string[], rl: ReadlineInterfaceAdvanced) => Promise<boolean>;
		readlineInterfaceOptions?: Partial<ReadLineOptions>;
	}
	export function isWithReadlineInterface(callback: TerminalCommandOptions): callback is TerminalCommandOptions.WithReadlineInterface {
		return callback.type === "WITH_READLINE_INTERFACE";
	}
}

export class TerminalCommands extends Map<string, TerminalCommandOptions> {
	/**
	 * @param callback If returns `false`, app will continue functioning after callback
	 * @param readlineInterfaceOptions.input If `undefined` will use `process.stdin`
	 * @param readlineInterfaceOptions.output If `undefined`, will use `process.stdout`
	 */
	registerWithReadlineInterface(name: string, callback: TerminalCommandOptions.WithReadlineInterface["callback"], readlineInterfaceOptions?: Partial<ReadLineOptions>) {
		this.set(name, {type: "WITH_READLINE_INTERFACE", callback, readlineInterfaceOptions});
		return this;
	}

	/**
	 * Works exactly like `set()`, but returns `this` for chaining
	 * @param callback If returns `false`, app will continue functioning after callback
	 */
	register(name: string, callback: TerminalCommandOptions.Default["callback"]) {
		this.set(name, {type: "DEFAULT", callback});
		return this;
	}

	async run() {
		const argv = process.argv.slice(2);
		if (argv.length > 0) {
			for (const [name, options] of this.entries()) {
				if (argv[0] === name) {
					if (TerminalCommandOptions.isWithReadlineInterface(options)) {
						const rl = ReadlineInterfaceAdvanced.create();
						const result = await options.callback(argv.slice(name.length + 1), rl);
						rl.close();
						return result;
					}
					return await options.callback(argv.slice(name.length + 1));
				}
			}

			console.log(`${argv[0]}: unknown command`);
			return true;
		}

		this.clear(); // cuz we dont need commands in runtime
		return false;
	}

	async question(rl: readline.Interface, query: string) {
		return await new Promise<string>(resolve => rl.question(query, answer => resolve(answer)));
	}
}
export default new TerminalCommands();