'use strict';

const type = require('./lib/js/type');
const buf = require('./lib/js/buf');

module.exports = {
	getType: type.get,
	create: buf.create,
	TYPE: {
		INT8: type.INT8,
		INT16: type.INT16,
		INT32: type.INT32,
		UINT8: type.UINT8,
		UINT16: type.UINT16,
		UINT32: type.UINT32,
		DOUBLE: type.DOUBLE,
		STR: type.STR,
		OBJ: type.OBJ,
		BOOL: type.BOOL,
		NUL: type.NUL,
		UNDEF: type.UNDEF,
		BIN: type.BIN,
		UNKNOWN: type.UNKNOWN
	},
	isInt8: isInt8,
	isInt16: isInt16,
	isInt32: isInt32,
	isUInt8: isUInt8,
	isUInt16: isUInt16,
	isUInt32: isUInt32,
	isDouble: isDouble,
	isString: isString,
	isObject: isObject,
	isBool: isBool,
	isNull: isNull,
	isUndefined: isUndefined,
	isBuffer: isBuffer,
};

function isInt8(val) {
	return type.get(val) === type.INT8;
}

function isInt16(val) {
	return type.get(val) === type.INT16;
}

function isInt32(val) {
	return type.get(val) === type.INT32;
}

function isUInt8(val) {
	return type.get(val) === type.UINT8;
}

function isUInt16(val) {
	return type.get(val) === type.UINT16;
}

function isUInt32(val) {
	return type.get(val) === type.UINT32;
}

function isDouble(val) {
	return type.get(val) === type.DOUBLE;
}

function isBool(val) {
	return type.get(val) === type.BOOL;
}

function isNull(val) {
	return type.get(val) === type.NUL;
}

function isObject(val) {
	return type.get(val) === type.OBJ;
}

function isString(val) {
	return type.get(val) === type.STR;
}

function isUndefined(val) {
	return type.get(val) === type.UNDEF;
}

function isBuffer(val) {
	return type.get(val) === type.BIN;
}

function isInt16(val) {
	return type.get(val) === type.INT16;
}

function isInt32(val) {
	return type.get(val) === type.INT32;
}

