'use strict';

const fs = require('fs');
const async = require('async');
const render = require('./render');

var files = [ '.js', '.cs', '.php' ];
var dirpath;
var loaded = {};
var client = '';

exports.getClient = function __renderLoaderGetClient() {
	return client;
};

exports.load = function __renderLoaderLoad(path, cb) {
	dirpath = path;
	load(path, cb);
};

exports.getAllPaths = function __renderLoadederGetAllPaths() {
	var paths = [];
	for (var path in loaded) {
		paths.push(path);
	}
	return paths;
};

exports.getLoadedByPath = function __renderLoaderGetLoadedByPath(path) {
	if (loaded[path]) {
		return loaded[path];
	}
	return null;
};

function getClientPath() {
	return __dirname;
}

function load(path, cb) {
	fs.stat(path, function __renderLoaderLoadStat(error, stats) {
		if (error) {
			return cb(error);
		}
		if (stats.isDirectory()) {
			fs.readdir(path, function __renderLoaderLoadReaddir(error, list) {
				if (error) {
					return cb(error);
				}
				path = path + ((path[path.length - 1] !== '/') ? '/' : '');
				async.each(list, function __renderLoaderLoadReaddirEach(file, next) {
					load(path + file, next);
				}, cb);
			});
			return;
		}
		// ignore everything but the files allowed
		if (files.indexOf(path.substring(path.length - 3)) === -1) {
			return cb();
		}
		fs.readFile(path, 'utf8', function __renderLoaderReadFile(error, content) {
			if (error) {
				return cb(error);
			}
			var pathName = path.replace(dirpath, '');
			var prerenderedData = render.prerender(content);
			loaded[pathName] = {
				source: prerenderedData.content,
				tags: prerenderedData.list,
				vars: prerenderedData.vars,
				literals: prerenderedData.literals
			};
			cb();
		});
	});
}
