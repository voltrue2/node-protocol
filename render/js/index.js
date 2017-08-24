'use strict';

const fs = require('fs');
const async = require('async');
const args = require('../../lib/args');
const loader = require('../../lib/loader');
const template = fs.readFileSync(__dirname + '/../../templates/js/struct.js', 'UTF-8');

const INDENT = '\t';

const tasks = [
	loadDSL,
	outputCode,
	copyNodeBufferCode
];

var renderedmap = {};

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

function outputCode(next) {
	var destpath = args.getDestPath();
	for (var name in renderedmap) {
		var path = destpath + '/' + name + '.js';
		console.log('Compiling the code to:', path);
		fs.writeFileSync(path, renderedmap[name], 'UTF-8');
	}
	next();
}

function copyNodeBufferCode(next) {
	var path = args.getDestPath() + '/lib/';
	try {
		fs.mkdirSync(path);
	} catch (e) {
		// well...
	}
	var srcpath = __dirname + '/../../src/js/';
	var buf = fs.readFileSync(srcpath + 'buf.js', 'UTF-8');
	fs.writeFileSync(path + 'buf.js', buf, 'UTF-8');
	var buffer = fs.readFileSync(srcpath + 'buffer.js', 'UTF-8');
	fs.writeFileSync(path + 'buffer.js', buffer, 'UTF-8');
	var index = fs.readFileSync(srcpath + 'index.js', 'UTF-8');
	fs.writeFileSync(path + 'node-buffer.js', index, 'UTF-8');
	var type = fs.readFileSync(srcpath + 'type.js', 'UTF-8');
	fs.writeFileSync(path + 'type.js', type, 'UTF-8');
	next();
}

function renderDSLList(list) {
	for (var i = 0, len = list.length; i < len; i++) {
		for (var key in list[i]) {
			var dsl = list[i][key];
			console.log('Render DSL:', key);
			renderDSL(key, dsl);
		}
	}
}

function renderDSL(name, dsl) {
	// copy from template
	var rendered = template;
	// render description
	rendered = renderDesc(rendered, name, dsl);
	// render property types
	rendered = renderTypeMap(rendered, name, dsl);
	// render props of .create()
	rendered = renderProps(rendered, name, dsl); 
	// keep rendered code in the map
	
	if (renderedmap[name]) {
		throw new Error('Duplicate DSL name [' + name + ']');
	}

	renderedmap[name] = rendered;
}

function renderDesc(rendered, name, dsl) {
	var dsc = name;
	if (dsl.description) {
		dsc = dsl.description;
	}
	return rendered.replace('{{ description }}', '/**\n' + dsc + '\n*/');
}

function renderTypeMap(rendered, name, dsl) {
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
			case 'datetime':
				str += INDENT + key + ': \'datetime\'';
				break;
			default:
				str += INDENT + key + ': nodeBuffer.TYPE.BUF';
		}
		types.push(str);
	}
	return rendered.replace('{{ propTypes }}', types.join(',\n'));
}

function renderProps(rendered, name, dsl) {
	var str = '{\n';
	var params = dsl.params;
	var list = [];
	for (var key in params) {
		var param = params[key];
		var defaultVal = param.default !== undefined ? param.default : null;
		list.push(INDENT + INDENT + key + ': ' + defaultVal);
	}
	return rendered.replace('{{ props }}', '{\n' +  list.join(',\n') + '\n' + INDENT + '}');
}

function done(error) {
	if (error) {
		console.error('Error:', error);
		process.exit(1);
	}
	console.log('[ Completed ]');
	process.exit(0);
}

