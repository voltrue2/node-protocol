
const fs = require('fs');
const async = require('async');
const loader = require('./src/loader');
const view = require('./src/view');
const render = require('./src/render');
const lib = require('./src/lib');
const js = require('./src/langs/javascript');
const cs = require('./src/langs/csharp');

const dslPath = process.argv[2];
const outputPath = process.argv[3];
const templatePath = __dirname + '/templates/';
const tasks = [
	check,
	loadSource,
	loadTemplates,
	renderCode,
	output
];
const renderedMap = {
	js: {},
	cs: {}
};
var source;

process.on('uncaughtException', function (error) {
	console.error(er(error.message + '\n' + error.stack));
});

// Shared lib functions
render.render.func('className', lib.className);
render.render.func('desc', lib.desc);
// Node.js code generator functions
render.render.func('getPropsJs', js.getProps);
render.render.func('getPackJs', js.getPack);
render.render.func('getUnpackJs', js.getUnpack);
// C# code generator functions
render.render.func('getPropsCs', cs.getProps);
render.render.func('getPackCs', cs.getPack);
render.render.func('getUnpackCs', cs.getUnpack);
render.render.func('getByteProps', cs.getByteProps);

async.series(tasks, done);

function check(next) {
	if (!dslPath) {
		return next(new Error('DSL path is not given'));
	}
	if (!outputPath) {
		return next(new Error('Output path is not given'));
	}
	next();
}

function loadSource(next) {
	if (dslPath[dslPath.length - 1] !== '/') {
		dslPath += '/';
	}
	console.log('Source DSL yml files from:', info(dslPath));
	loader.loadSource(dslPath, function (error, list) {
		if (error) {
			return next(error);
		}
		view.setup(list);
		source = view.getAllData();
		// pass source map to js
		js.source(source);
		// pass source map to cs
		cs.source(source);
		next();
	});
}

function loadTemplates(next) {
	console.log('Code templates from:', info(templatePath));
	render.config(templatePath);
	render.setup(function (error) {
		if (error) {
			return next(error);
		}
		const paths = render.render.getAllPaths();
		if (!paths.length) {
			return next(new Error('No templates found in:' + templatePath));
		}
		for (var i = 0, len = paths.length; i < len; i++) {
			console.log('Template:', info(paths[i]));
		}
		next();
	});
}

function renderCode(next) {
	var index = 0;
	for (const name in source) {
		_renderJs(index, source[name]);
		_renderCs(index, source[name]);
		index += 1;
	}
	next();
}

function _renderJs(index, data) {
	data.index = index;
	data.buffer = view.getBufferCode();
	const path = 'js/' + data.dsl + '.js';
	const rendered = render.render(path, data);
	renderedMap.js[data.name] = { type: '.js', data: rendered };
	console.log('Code rendered:', ok(data.name), 'as:', ok(path));
}

function _renderCs(index, data) {
	data.index = index;
	data.buffer = view.getBufferCode();
	const path = 'cs/' + data.dsl + '.cs';
	const rendered = render.render(path, data);
	renderedMap.cs[data.name] = { type: '.cs', data: rendered };
	console.log('Code rendered:', ok(data.name), 'as:', ok(path));
}

function output(next) {
	if (outputPath[outputPath.length - 1] !== '/') {
		outputPath += '/';
	}
	console.log('Output rendered code in:', ok(outputPath));
	const langs = Object.keys(renderedMap);
	async.forEach(langs, function (lang, moveon) {
		var path = outputPath + lang + '/';
		fs.mkdir(path, function (error) {
			var list = Object.keys(renderedMap[lang]);
			async.forEach(list, function (name, _moveon) {
				var item = renderedMap[lang][name];
				console.log('Output code:', ok(path + name + item.type));
				fs.writeFile(path + name + item.type, item.data, 'utf8', _moveon);
			}, moveon);
		});
	}, next);
}

function done(error) {
	if (error) {
		console.error(er(error.message + '\n' + error.stack));
		return process.exit(1);
	}
	process.exit(0);
}

function er(str) {
	return '\033[0;31m' + str + '\033[0m';
}

function info(str) {
	return '\033[0;34m' + str + '\033[0m';
}

function ok(str) {
	return '\033[0;32m' + str + '\033[0m';
}

