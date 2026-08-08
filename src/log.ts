import Core from "./index.js";

const FATAL_PROCESS_EXIT_CODE = "";

export function makeFunctions(moduleName: string): {
	info: (msg: any, options?: {args?: Record<string, any>, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean}) => void,
	verbose: (msg: any, options?: {args?: Record<string, any>, module?: string, ignoreNextStacks?: number}) => void,
	warn: (msg: any, options?: {args?: Record<string, any>, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean}) => void,
	error: (msg: any, options?: {args?: Record<string, any>, error?: any, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean}) => void,
	fatal: (msg: any, options?: {args?: Record<string, any>, error?: any, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean, errorCode?: number}) => never,
} {
	return {
		info: (msg, options) => {
			if (!options)
				options = {};
			options.ignoreNextStacks = options.ignoreNextStacks ? options.ignoreNextStacks : 2;
			return info(msg, { args: options.args, module: options.module ?? moduleName, ignoreNextStacks: options.ignoreNextStacks, dontPrintTerminal: options.dontPrintTerminal, dontPrintFile: options.dontPrintFile });
		},
		verbose: (msg, options) => {
			if (!options)
				options = {};
			options.ignoreNextStacks = options.ignoreNextStacks ? options.ignoreNextStacks : 2;
			return verbose(msg, { args: options?.args, module: options?.module ?? moduleName, ignoreNextStacks: options.ignoreNextStacks });
		},
		warn: (msg, options) => {
			if (!options)
				options = {};
			options.ignoreNextStacks = options.ignoreNextStacks ? options.ignoreNextStacks : 2;
			return warn(msg, { args: options?.args, module: options?.module ?? moduleName, ignoreNextStacks: options.ignoreNextStacks, dontPrintTerminal: options?.dontPrintTerminal, dontPrintFile: options?.dontPrintFile });
		},
		error: (msg, options) => {
			if (!options)
				options = {};
			options.ignoreNextStacks = options.ignoreNextStacks ? options.ignoreNextStacks : (msg instanceof Error || options.error instanceof Error ? 0 : 2);
			return error(msg, { args: options.args, module: options.module ?? moduleName, error: options.error, ignoreNextStacks: options.ignoreNextStacks, dontPrintTerminal: options.dontPrintTerminal, dontPrintFile: options.dontPrintFile });
		},
		fatal: (msg, options) => {
			if (!options)
				options = {};
			options.ignoreNextStacks = options.ignoreNextStacks ? options.ignoreNextStacks : (msg instanceof Error || options.error instanceof Error ? 0 : 2);
			return fatal(msg, { args: options.args, module: options.module ?? moduleName, error: options.error, ignoreNextStacks: options.ignoreNextStacks, dontPrintTerminal: options.dontPrintTerminal, dontPrintFile: options.dontPrintFile, errorCode: options.errorCode });
		}
	};
}

export function verbose(msg: any, options?: {args?: Record<string, any>, module?: string, ignoreNextStacks?: number}) {
	if (!options) options = {};
	if (!options.module) options.module = Core.name;

	let message = "";

	// time, [HH:MM:SS]
	const date = new Date();
	const time = {h: formatDigit(date.getUTCHours()), m: formatDigit(date.getUTCMinutes()), s: formatDigit(date.getUTCSeconds()), ms: formatDigit(date.getUTCMilliseconds())};
	message += `[${time.h}:${time.m}:${time.s}.${time.ms}] `;

	// specify log type
	message += `[VERBOSE] `;

	// script file path & log message
	ignoreNextStacks = options.ignoreNextStacks ?? 1;
	const stack = new Error().stack;
	message += `[${latestStackFilePart}] ${msg}`;

	// arguments specified in options.args
	if (options.args) for (let [k, v] of Object.entries(options.args)) {
		v = JSON.stringify(v);
		message += `\n    ${k}: ${v}`;
	}

	message += "\n\n";

	Core.fs.append(getLogFilePath(options.module), message);
}

export function info(msg: any, options?: {args?: Record<string, any>, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean}) {
	if (!options) options = {};
	if (!options.module) options.module = Core.name;

	const message = { file: "", terminal: "" };

	// time, [HH:MM:SS]
	const date = new Date();
	const time = {h: formatDigit(date.getUTCHours()), m: formatDigit(date.getUTCMinutes()), s: formatDigit(date.getUTCSeconds()), ms: formatDigit(date.getUTCMilliseconds())};
	message.file +=     `[${time.h}:${time.m}:${time.s}.${time.ms}] `;
	message.terminal += `[\x1b[34m${time.h}:${time.m}:${time.s}.${time.ms}\x1b[0m] `;

	// specify log type
	message.file +=     `[INFO] `;
	message.terminal += `[INFO] `;

	// script file path & log message
	ignoreNextStacks = options.ignoreNextStacks ?? 1;
	const stack = new Error().stack;
	message.file +=     `[${latestStackFilePart}] ${msg}`;
	message.terminal += `[\x1b[36m${options.module}\x1b[0m] ${msg}`;

	// arguments specified in options.args
	if (options.args) for (let [k, v] of Object.entries(options.args)) {
		v = JSON.stringify(v);
		message.file +=     `\n    ${k}: ${v}`;
		//message.terminal += `\n    ${k}: \x1b[32m${v}\x1b[0m`;
	}

	// stack trace
	//if (stack) {
		//message.file +=     `\n${latestStackTrace}`;
		//message.terminal += `\n${latestStackTrace}`; // uncomment for printing stacks to terminal
	//}

	message.file +=     "\n\n";
	message.terminal += "\n\n";

	if (!options.dontPrintFile)
		Core.fs.append(getLogFilePath(options.module), message.file);
	if (!options.dontPrintTerminal) {
		if (stopTerminalOutput)
			terminalOutput.push(message.terminal);
		else
			process.stdout.write(message.terminal);
	}
}

export function warn(msg: any, options?: {args?: Record<string, any>, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean}) {
	if (!options) options = {};
	if (!options.module) options.module = Core.name;

	const message = { file: "", terminal: "" };

	// time, [HH:MM:SS]
	const date = new Date();
	const time = {h: formatDigit(date.getUTCHours()), m: formatDigit(date.getUTCMinutes()), s: formatDigit(date.getUTCSeconds()), ms: formatDigit(date.getUTCMilliseconds())};
	message.file +=     `[${time.h}:${time.m}:${time.s}.${time.ms}] `;
	message.terminal += `[\x1b[34m${time.h}:${time.m}:${time.s}.${time.ms}\x1b[0m] `;

	// specify log type
	message.file +=     `[WARN] `;
	message.terminal += `[WARN] `;

	// script file path & log message
	ignoreNextStacks = options.ignoreNextStacks ?? 1;
	const stack = new Error().stack;
	message.file +=     `[${latestStackFilePart}] ${msg}`;
	message.terminal += `[\x1b[36m${options.module}\x1b[0m] ${msg}`;

	// arguments specified in options.args
	if (options.args) for (let [k, v] of Object.entries(options.args)) {
		v = JSON.stringify(v);
		message.file +=     `\n    ${k}: ${v}`;
		//message.terminal += `\n    ${k}: \x1b[32m${v}\x1b[0m`;
	}

	// stack trace
	//if (stack) {
		//message.file +=     `\n${latestStackTrace}`;
		//message.terminal += `\n${latestStackTrace}`; // uncomment for printing stacks to terminal
	//}

	message.file +=     "\n\n";
	message.terminal += "\n\n";

	if (!options.dontPrintFile)
		Core.fs.append(getLogFilePath(options.module), message.file);
	if (!options.dontPrintTerminal) {
		if (stopTerminalOutput)
			terminalOutput.push(message.terminal);
		else
			process.stdout.write(message.terminal);
	}
}

export function error(msg: any, options?: {args?: Record<string, any>, error?: any, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean}) {
	if (!options) options = {};
	if (!options.module) options.module = Core.name;

	const message = { file: "", terminal: "" };

	// time, [HH:MM:SS]
	const date = new Date();
	const time = {h: formatDigit(date.getUTCHours()), m: formatDigit(date.getUTCMinutes()), s: formatDigit(date.getUTCSeconds()), ms: formatDigit(date.getUTCMilliseconds())};
	message.file +=     `[${time.h}:${time.m}:${time.s}.${time.ms}] `;
	message.terminal += `[\x1b[34m${time.h}:${time.m}:${time.s}.${time.ms}\x1b[0m] `;

	// specify log type
	message.file +=     `[ERROR] `;
	message.terminal += `[\x1b[31mERROR\x1b[0m] `;

	// script file path & log message
	let stack: string | undefined;
	let error = options.error instanceof Error ? options.error : (msg instanceof Error ? msg : null);
	if (error instanceof Error) {
		ignoreNextStacks = options.ignoreNextStacks ?? 0;
		stack = error.stack;
		message.file +=     `[${latestStackFilePart}] ${msg}`;
		message.terminal += `[\x1b[36m${options.module}\x1b[0m] ${msg}`;

		const fields = Object.getOwnPropertyNames(error);
		fields.splice(fields.indexOf("message"), 1);
		if (fields.includes("stack")) fields.splice(fields.indexOf("stack"), 1);
		if (!options.args) options.args = {};
		for (let k of fields) {
			while (true) {
				if (options.args[k]) k = `_${k}`;
				else break;
			}
			options.args[k] = (error as any)[k];
		}
	}
	else {
		ignoreNextStacks = options.ignoreNextStacks ?? 1;
		stack = new Error().stack;
		message.file +=     `[${latestStackFilePart}] ${msg}`;
		message.terminal += `[\x1b[36m${options.module}\x1b[0m] ${msg}`;
	}

	// arguments specified in options.args
	if (options.args) for (let [k, v] of Object.entries(options.args)) {
		v = JSON.stringify(v);
		message.file +=     `\n    ${k}: ${v}`;
		//message.terminal += `\n    ${k}: \x1b[32m${v}\x1b[0m`;
	}

	// stack trace
	if (stack) {
		if (options.error)
			message.file += `\nCaused by: ${options.error instanceof Error ? `${options.error.name}: ${options.error.message}` : options.error}`;
		message.file +=     `\n${latestStackTrace}`;
		//message.terminal += `\n${latestStackTrace}`; // uncomment for printing stacks to terminal
	}

	message.file +=     "\n\n";
	message.terminal += "\n\n";

	if (!options.dontPrintFile)
		Core.fs.append(getLogFilePath(options.module), message.file);
	if (!options.dontPrintTerminal) {
		if (stopTerminalOutput)
			terminalOutput.push(message.terminal);
		else
			process.stdout.write(message.terminal);
	}
}

export function fatal(msg: any, options?: {args?: Record<string, any>, error?: any, module?: string, ignoreNextStacks?: number, dontPrintTerminal?: boolean, dontPrintFile?: boolean, errorCode?: number}) {
	if (!options) options = {};
	if (!options.module) options.module = Core.name;

	const message = { file: "", terminal: "" };

	// time, [HH:MM:SS]
	const date = new Date();
	const time = {h: formatDigit(date.getUTCHours()), m: formatDigit(date.getUTCMinutes()), s: formatDigit(date.getUTCSeconds()), ms: formatDigit(date.getUTCMilliseconds())};
	message.file +=     `[${time.h}:${time.m}:${time.s}.${time.ms}] `;
	message.terminal += `[\x1b[34m${time.h}:${time.m}:${time.s}.${time.ms}\x1b[0m] `;

	// specify log type
	message.file +=     `[ERROR] `;
	message.terminal += `[\x1b[31mFATAL\x1b[0m] `;

	// script file path & log message
	let stack: string | undefined;
	let error = options.error instanceof Error ? options.error : (msg instanceof Error ? msg : null);
	if (error instanceof Error) {
		ignoreNextStacks = options.ignoreNextStacks ?? 0;
		stack = error.stack;
		message.file +=     `[${latestStackFilePart}] ${msg}`;
		message.terminal += `[\x1b[36m${options.module}\x1b[0m] ${msg}`;

		const fields = Object.getOwnPropertyNames(error);
		fields.splice(fields.indexOf("message"), 1);
		if (fields.includes("stack")) fields.splice(fields.indexOf("stack"), 1);
		if (!options.args) options.args = {};
		for (let k of fields) {
			while (true) {
				if (options.args[k]) k = `_${k}`;
				else break;
			}
			options.args[k] = (error as any)[k];
		}
	}
	else {
		ignoreNextStacks = options.ignoreNextStacks ?? 1;
		stack = new Error().stack;
		message.file +=     `[${latestStackFilePart}] ${msg}`;
		message.terminal += `[\x1b[36m${options.module}\x1b[0m] ${msg}`;
	}

	// arguments specified in options.args
	if (options.args) for (let [k, v] of Object.entries(options.args)) {
		v = JSON.stringify(v);
		message.file +=     `\n    ${k}: ${v}`;
		//message.terminal += `\n    ${k}: \x1b[32m${v}\x1b[0m`;
	}

	// stack trace
	if (stack) {
		let part = ""
		if (options.error) {
			part = `\nCaused by: ${options.error instanceof Error ? `${options.error.name}: ${options.error.message}` : options.error}`;
			message.file += part;
			message.terminal += part;
		}
		part =     `\n${latestStackTrace}`;
		message.file += part;
		message.terminal += part;
	}

	message.file +=     "\n\n";
	message.terminal += "\n\n";

	if (!options.dontPrintFile)
		Core.fs.append(getLogFilePath(options.module), message.file);
	if (!options.dontPrintTerminal) {
		if (stopTerminalOutput)
			terminalOutput.push(message.terminal);
		else
			process.stdout.write(message.terminal);
	}
	return process.exit(options.errorCode ?? FATAL_PROCESS_EXIT_CODE);
}

let stopTerminalOutput: boolean = true;
const terminalOutput: string[] = [];

export function releaseStoppedTerminalOutput() {
	if (!stopTerminalOutput) return;
	stopTerminalOutput = false;
	while(terminalOutput.length > 0) {
		process.stdout.write(terminalOutput.shift()!);
	}
}

const FileName = "latest.log" as const;
let ignoreNextStacks: number | undefined = undefined;
let latestStackTrace: string = "";
let latestStackFilePart: string;

export function initialize() {
	// stylize Error.stack
	Error.prepareStackTrace = (error, stacks) => {
		let i = 0;
		if (ignoreNextStacks) {
			i = ignoreNextStacks;
			ignoreNextStacks = undefined;
		}

		let filePart: string | undefined = formatStackFilePart(stacks[i] ?? stacks[0]);
		latestStackFilePart = filePart;

		let message = `Stack trace:`;
		for (; i < stacks.length; i++) {
			const s = stacks[i];

			// formatting line, looks like this: at <class_name>.<method_name>(<script_filepath>:<line_number>:<column_number>)
			message += `\n    at `;

			// inserting class and method name
			const typeName = s.getTypeName();
			const functionName = s.getFunctionName();
			const methodName = s.getMethodName();
			if (functionName) {
				if (methodName)
					message += `${typeName}.${functionName}`;
				else
					message += functionName;
			} else // if (methodName)
				message += `${typeName}.${methodName ?? "<anonymous>"}`;

			// inserting script file path, line and column number
			
			if (!filePart) filePart = formatStackFilePart(s);
			message += `(${filePart})`;
			filePart = undefined;
		}
		latestStackTrace = message;
		return `${error.name}: ${error.message}\n\n${message}`;
	};

	process.on("uncaughtException", error => {
		Core.log.releaseStoppedTerminalOutput();
		fatal("Uncaught exception occurred", {error, errorCode: 1});
	});
}

function formatStackFilePart(stack: NodeJS.CallSite) {
	let part = "";

	const filePath = stack.getFileName();
	if (filePath) {
		part = filePath.replaceAll("\\", "/");
		if (part.startsWith("file:///"))
			part = part.substring(8);
		if (!/^\w:\//.test(part))
			part = `/${part}`;
		if (part.startsWith(Core.directory))
			part = "." + part.substring(Core.directory.length);
	}

	const lineNumber = stack.getLineNumber();
	if (lineNumber) {
		part += `:${lineNumber}`;
		const columnNumber = stack.getColumnNumber();
		if (columnNumber)
			part += `:${columnNumber}`;
	}

	return part;
}

function formatDigit(n: number, count: number = 2) {
	count -= 1;
	if (n < Math.pow(10, count)) {
		let str = "";
		for (let i = 0; i < count; i++) str += "0";
		return `${str}${n}`;
	}
	return `${n}`;
}

function formatDateToLogFileName(date: Date) {
	return `${`${date.getUTCFullYear()}`.substring(2)}-${formatDigit(date.getUTCMonth() + 1)}-${formatDigit(date.getUTCDate())}.log`;
}

let currentPreviousFileName: string;
function checkIfAnotherDayBegins(path: string) {
	if (!currentPreviousFileName) {
		let stat;
		try {
			stat = Core.fs.stat(path);
		}
		catch(e) {
			if (e.code === "ENOENT") {
				Core.fs.write(path, "");
				stat = Core.fs.stat(path);
			}
			else
				throw e;
		}
		currentPreviousFileName = formatDateToLogFileName(new Date(stat.atimeMs));
	}

	const previousFileName = formatDateToLogFileName(new Date());
	const result = currentPreviousFileName !== previousFileName;
	if (result) {
		currentPreviousFileName = previousFileName;
		return previousFileName;
	}
	
	return undefined;
}

function getLogFilePath(moduleName: string) {
	const path = `${moduleName}/${FileName}`;

	const previousFileName = checkIfAnotherDayBegins(path);
	if (previousFileName) {
		const content = Core.fs.read(path);
		if (content.length > 0) {
			Core.fs.write(`${moduleName}/${previousFileName}`, content);
		}
	}

	return path;
}