'use strict';

const fs = require('fs');
const async = require('async');
const args = require('../../lib/args');
const loader = require('../../lib/loader');
const template = fs.readFileSync(__dirname + '/../../templates/js/struct.js', 'UTF-8');

const INDENT = '\t';

const tasks = [
	loadDSL
];

var rendered = {};

async.series(tasks, done);

function loadDSL(next) {
	console.log('Loading yaml DSL from:', args.getDSLPath());
	loader.loadYamlDSL(args.getDSLPath(), function (error, list) {
		if (error) {
			return next(error);
		}
		renderDSLList(list);
		next();
	});	
}

function renderDSLList(list) {
	for (var i = 0, len = list.length; i < len; i++) {
		var keys = Object.keys(list[i]);
		var dsl = list[i][keys[0]];
		renderDSL(keys[0], dsl);
	}
}

function renderDSL(name, dsl) {
	// copy from template
	var rendered = template;
	// render description
	var dsc = name;
	if (dsl.description) {
		dsc = dsl.description;
	}
	rendered = rendered.replace('{{ description }}', '/**\n' + dsc + '\n*/');
	// render property types
	var params = dsl.params;
	var types = [];
	for (var key in params) {
		var type = params[key].type;
		var str = params[key].comment ? INDENT + '// ' + params[key].comment + '\n' : '';
		switch (type) {
			case 'int8':
				str += INDENT + key + ': nodeBuffer.TYPE.INT8';
				break;
			case 'uint8':
				str += INDENT + key + ': nodeBuffer.TYPE.UINT8';
				break;
			case 'int16':
				str += INDENT + key + ': nodeBuffer.TYPE.INT16';
				break;
			case 'uint16':
				str += INDENT + key + ': nodeBuffer.TYPE.UINT16';
				break;
			case 'int32':
				str += INDENT + key + ': nodeBuffer.TYPE.INT32';
				break;
			case 'uint32':
				str += INDENT + key + ': nodeBuffer.TYPE.UINT32';
				break;
			case 'double':
				str += INDENT + key + ': nodeBuffer.TYPE.DOUBLE';
				break;
			case 'string':
				str += INDENT + key + ': nodeBuffer.TYPE.STR';
				break;
			case 'bool':
				str += INDENT + key + ': nodeBuffer.TYPE.BOOL';
				break;
			case 'bin':
				str += INDENT + key + ': nodeBuffer.TYPE.BIN';
				break;
		}
		types.push(str);
	}
	rendered = rendered.replace('{{ propTypes }}', types.join(',\n'));

	console.log('-----------------------------');
	console.log(rendered);
	console.log('-----------------------------');

}

function done(error) {
	if (error) {
		console.error('Error:', error);
		process.exit(1);
	}
	console.log('[ Completed ]');
	process.exit(0);
}

