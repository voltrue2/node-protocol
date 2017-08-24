'use strict';

const fs = require('fs');
const async = require('async');
const yaml = require('js-yaml');

module.exports.loadYamlDSL = loadYamlDSL;

function loadYamlDSL(path, cb) {
	var rlist = [];
	fs.readdir(path, function (error, list) {
		if (error) {
			return cb(error);
		}
		async.forEach(list, _check, _done);
	});

	function _check(item, next) {
		var _path = path + '/' + item;
		fs.lstat(_path, function (error, stat) {
			if (error) {
				return next(error);
			}
			if (stat.isDirectory()) {
				loadYamlDSL(_path, function (error, _rlist) {
					if (error) {
						return next(error);
					}
					rlist = rlist.concat(_rlist);
					next();
				});
				return;
			}
			// ignore all files except for .yml
			if (_path.substring(_path.length - 4) !== '.yml') {
				return next();
			}
			_read(_path, next);
		});
	}
	
	function _read(filepath, _next) {
		console.log('Loading yaml DSL files:', filepath);
		fs.readFile(filepath, 'utf8', function (error, data) {
			if (error) {
				return _next(error);
			}
			rlist.push(yaml.safeLoad(data));
			_next();
		});
	}

	function _done(error) {
		if (error) {
			return cb(error);
		}
		cb(null, rlist);
	}
}
