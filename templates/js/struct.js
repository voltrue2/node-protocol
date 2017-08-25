'use strict';
{{ description }}
const nodeBuffer = require('./lib/node-buffer');
{{ requires }}
const id = {{ id }};
const types = {
{{ propTypes }}
};

module.exports = {
	create: create,
	pack: pack,
	unpack: unpack,
	// private method
	_types: _types
};

function _types() {
	return types;
}

function create() {
	return {{ props }};
}

function pack(obj) {
	var buf = nodeBuffer.create();
	for (var key in types) {
		if (obj[key] === undefined) {
			throw new Error('Property[' + key + '] is missing');
		}
		var val = obj[key];
		switch (types[key]) {
			case nodeBuffer.TYPE.INT8:
				if (!nodeBuffer.isInt8(obj[key])) {
					throw new Error('Property[' + key + '] must be Int8');
				}
				break;
			case nodeBuffer.TYPE.UINT8:
				if (!nodeBuffer.isUInt8(obj[key])) {
					throw new Error('Property[' + key + '] must be UInt8');
				}
				break;
			case nodeBuffer.TYPE.INT16:
				if (!nodeBuffer.isInt16(obj[key])) {
					throw new Error('Property[' + key + '] must be Int16');
				}
				break;
			case nodeBuffer.TYPE.UINT16:
				if (!nodeBuffer.isUInt16(obj[key])) {
					throw new Error('Property[' + key + '] must be UInt16');
				}
				break;
			case nodeBuffer.TYPE.INT32:
				if (!nodeBuffer.isInt32(obj[key])) {
					throw new Error('Property[' + key + '] must be Int8');
				}
				break;
			case nodeBuffer.TYPE.UINT32:
				if (!nodeBuffer.isUInt32(obj[key])) {
					throw new Error('Property[' + key + '] must be UInt8');
				}
				break;
			case nodeBuffer.TYPE.DOUBLE:
				if (!nodeBuffer.isDouble(obj[key])) {
					throw new Error('Property[' + key + '] must be double');
				}
				break;
			case nodeBuffer.TYPE.BOOL:
				if (!nodeBuffer.isDouble(obj[key])) {
					throw new Error('Property[' + key + '] must be bool');
				}
				break;
			case nodeBuffer.TYPE.STR:
				if (!nodeBuffer.isString(obj[key])) {
					throw new Error('Property[' + key + '] must be string');
				}
				break;
			case nodeBuffer.TYPE.BIN:
				if (!nodeBuffer.isBuffer(obj[key])) {
					throw new Error('Property[' + key + '] must be buffer');
				}
				break;
			case nodeBuffer.TYPE.BUF:
				val = requires[key].pack(val);
				break;
			case 'datetime':
				if (!val instanceof Date) {
					throw new Error('Property[' + key + '] must be datetime/double');
				}
				val = new Date(val).getTime();
				break;
				
		}
		buf.add(val);
	}
	return buf.finalize();
}

function unpack(buf) {
	var parsed = nodeBuffer.parse(buf);
	var i = 0;
	var res = {};
	for (var key in types) {
		var type = types[key];
		if (type === nodeBuffer.TYPE.BUF) {
			res[key] = _unpack(key, parsed[i]);
		} else {
			res[key] = parsed[i];
		}
		i += 1;
	}
	return res;
}

function _unpack(key, parsed) {
	var res = {};
	var struct = requires[key].create();
	var types = struct._types();
	var i = 0;
	for (var k in types) {
		var val = parsed[i];
		if (types[k] === nodeBuffer.TYPE.BUF) {
			res[k] = _unpack(k, val);
		} else {
			res[k] = val;
		}
		i += 1;
	}
	return res;
}

