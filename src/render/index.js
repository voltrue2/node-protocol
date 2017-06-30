'use strict';

// default TTL is 60 minutes
var DEFAULT_TTL = 1000 * 60 * 60;

var loader = require('./loader');
var render = require('./render');
var cache = require('./cache');
var func = require('./func');
var pathPrefix;

exports.config = function __renderIndexConfig(path, cacheSize) {
	pathPrefix = path;
	if (cacheSize !== undefined) {
		cache.setMemSize(cacheSize);
	}
};

exports.setup = function __renderIndexSetup(cb) {
	if (!pathPrefix) {
		return cb(new Error('Missing template path'));
	}
	loader.load(pathPrefix, cb);	
};

exports.render = function __renderIndexRender(path, vars, cacheTtl) {
	if (cacheTtl === undefined) {
		cacheTtl = DEFAULT_TTL;
	}
	if (cacheTtl) {
		var res = cache.get(vars);
		if (res) {
			return res;
		}
		var rendered = render.render(path, vars);
		cache.set(vars, rendered, cacheTtl);
		return rendered;
	}
	return render.render(path, vars);
};

exports.render.getAllPaths = function __renderIndexGetAllPaths() {
	return render.getAllPaths();
};

exports.render.func = function __renderIndexFunc(name, handler) {
	func.add(name, handler);
};
