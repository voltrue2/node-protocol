'use strict';

const DSL_PATH_NAME = 'dsl=';
const DEST_PATH_NAME = 'out=';

var dslPath;
var destPath;

module.exports = {
	getDSLPath: getDSLPath,
	getDestPath: getDestPath
};

for (var i = 0, len = process.argv.length; i < len; i++) {
	var arg = process.argv[i];
	if (arg.indexOf(DSL_PATH_NAME) === 0) {
		dslPath = arg.replace(DSL_PATH_NAME, '');
		continue;
	} else if (arg.indexOf(DEST_PATH_NAME) === 0) {
		destPath = arg.replace(DEST_PATH_NAME, '');
		continue;
	}
}

if (!dslPath) {
	console.error('Parameter dsl=<path of yaml DSL files> is missing');
	process.exit(1);
}

if (!destPath) {
	console.error('Parameter out=<path of compile code destination> is missing');
	process.exit(1);
}

function getDSLPath() {
	return dslPath;
}

function getDestPath() {
	return destPath;
}

