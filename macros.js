// @ts-check
import fs from "fs";

/**
 * 
 * @param {string} filePath 
 * @param {string} valueName 
 */
function getValueFromJSON(filePath, valueName) {
	return JSON.parse(fs.readFileSync(filePath).toString())[valueName];
}
/**
 * 
 * @param {string} filePath 
 * @param {string} replace 
 * @param {string} replaceBy 
 */
function replaceValueInFile(filePath, replace, replaceBy) {
	fs.writeFileSync(filePath, fs.readFileSync(filePath).toString().replaceAll(replace, replaceBy));
}

/** @type ({ fromFile: string; toFile: string; value: string; fromValue: undefined; toValue: undefined; } | { fromFile: string; toFile: string; value: undefined; fromValue: string; toValue: string; })[] */
const macros = getValueFromJSON("./package.json", "macros");
for (const macro of macros) {
	/** @type string */
	let value;
	if (macro.value != null) {
		value = macro.value;
		const valueDisplay = macro.value.startsWith("this.") ? macro.value.substring(5) : macro.value;
		process.stdout.write(`(${macro.toFile}).${valueDisplay} = `);
	}
	else {
		value = getValueFromJSON(macro.fromFile, macro.fromValue);
		const toValueDisplay = macro.toValue.startsWith("this.") ? macro.toValue.substring(5) : macro.toValue;
		const fromValueDisplay = macro.fromValue.startsWith("this.") ? macro.fromValue.substring(5) : macro.fromValue;
		process.stdout.write(`(${macro.toFile}).${toValueDisplay} = (${macro.fromFile}).${fromValueDisplay} => `);
	}

	replaceValueInFile(macro.toFile, `${macro.toValue} = "";`, `${macro.toValue} = ${JSON.stringify(value)};`);
	console.log(JSON.stringify(value));
}