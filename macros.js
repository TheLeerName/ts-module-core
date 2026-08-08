import fs from "fs";

function getValueFromJSON(filePath, valueName) {
	return JSON.parse(fs.readFileSync(filePath).toString())[valueName];
}
function replaceValueInFile(filePath, replace, replaceBy) {
	fs.writeFileSync(filePath, fs.readFileSync(filePath).toString().replaceAll(replace, replaceBy));
}

const macros = getValueFromJSON("./package.json", "macros");
for (const macro of macros) {
	process.stdout.write(`(${macro.toFile}).${macro.toValue} = `);

	let value;
	if (macro.value) {
		value = macro.value;
	}
	else {
		value = getValueFromJSON(macro.fromFile, macro.fromValue);
		process.stdout.write(`(${macro.fromFile}).${macro.fromValue} => `);
	}

	replaceValueInFile(macro.toFile, `${macro.toValue} = "";`, `${macro.toValue} = ${JSON.stringify(value)};`);
	console.log(JSON.stringify(value));
}