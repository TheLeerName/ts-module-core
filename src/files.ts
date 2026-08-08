import fs from "fs";
import path from "path";

export class CustomError extends Error {
	readonly file?: string;
	constructor(message: string, file?: string) {
		super(message);
		this.file = file;
	}
}

export class FilesController {
	private Directory = "data" as const;

	initialize() {
		const directoryStat = fs.statSync(this.Directory, {throwIfNoEntry: false});
		if (directoryStat) {
			if (!directoryStat.isDirectory())
				throw new CustomError("Directory is file, rename or remove this file", this.Directory);
		}
		else
			fs.mkdirSync(this.Directory);
	}

	exists(filePath: string) {
		filePath = `${this.Directory}/${filePath}`;
		return fs.existsSync(filePath);
	}

	read(filePath: string) {
		filePath = `${this.Directory}/${filePath}`;
		try {
			return this.fsOperationSafe(filePath, () => fs.readFileSync(filePath));
		}
		catch(e) {
			if (e.code === "ENOENT") {
				const content = "";
				fs.writeFileSync(filePath, content);
				return content;
			}
			throw e;
		}
	}

	write(filePath: string, data: string | NodeJS.ArrayBufferView) {
		filePath = `${this.Directory}/${filePath}`;
		return this.fsOperationSafe(filePath, () => fs.writeFileSync(filePath, data));
	}

	append(filePath: string, data: string | Uint8Array) {
		filePath = `${this.Directory}/${filePath}`;
		return this.fsOperationSafe(filePath, () => fs.appendFileSync(filePath, data));
	}

	open(filePath: string, flags: fs.OpenMode, mode?: fs.Mode) {
		filePath = `${this.Directory}/${filePath}`;
		return this.fsOperationSafe(filePath, () => fs.openSync(filePath, flags, mode));
	}

	stat(filePath: string) {
		filePath = `${this.Directory}/${filePath}`;
		return this.fsOperationSafe(filePath, () => fs.statSync(filePath));
	}

	close(fd: number) {
		return fs.closeSync(fd);
	}

	protected fsOperationSafe<V>(filePath: string, cb: () => V): V {
		try {
			return cb();
		} catch(e) {
			if (e.code === "ENOENT") {
				fs.mkdirSync(path.dirname(filePath), {recursive: true});
				return cb();
			}
			throw e;
		}
	}
}

export default new FilesController();