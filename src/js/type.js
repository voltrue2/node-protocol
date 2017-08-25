'use strict';

const buffer = require('./buffer');

const INT8 = 1;
const INT16 = 2;
const INT32 = 3;
const UINT8 = 11;
const UINT16 = 12;
const UINT32 = 13;
const DOUBLE = 14;
const BOOL = 16;
const STR = 20;
const BUF = 254;
const BIN = 255;
/* we do not support these b/c C# counter part does not
const NUL = 30;
const UNDEF = 31;
const OBJ = 40;
*/
const UNKNOWN = 0;

// 4-byte long name to identify Buf object binary
const BUF_NAME = buffer.alloc('nbuf');

module.exports = {
	get: get,
	INT8: INT8,
	INT16: INT16,
	INT32: INT32,
	UINT8: UINT8,
	UINT16: UINT16,
	UINT32: UINT32,
	DOUBLE: DOUBLE,
	BOOL: BOOL,
	STR: STR,
	BUF: BUF,
	BIN: BIN,
	/*
	NUL: NUL,
	UNDEF: UNDEF,
	OBJ: OBJ,
	*/
	BUF: BUF,
	BIN: BIN,
	UNKNOWN: UNKNOWN,
	BUF_NAME: Buffer.concat([ BUF_NAME ])
};

function get(value) {
	var type = typeof value;
	switch (type) {
		case 'string':
			return STR;
		case 'number':
			return getIntType(value);
		case 'object':
			return getObjType(value);
		case 'boolean':
			return BOOL;
		case 'undefined':
			throw new Error('Value cannot be undefined');
			//return UNDEF;
		default:
			return UNKNOWN;
	}
}

function getIntType(value) {
	if (value < 0) {
		if (value >= -128) {
			return INT8;
		} else if (value >= -32768) {
			return INT16;
		}
		return INT32;
	}
	if (value <= 0xff) {
		return UINT8;
	} else if (value <= 0xffff) {
		return UINT16
	} else if (value <= 0xffffffff) {
		return UINT32;
	}
	return DOUBLE;
}

function getObjType(value) {
	if (value === null) {
		throw new Error('Value cannot be a null');
		//return NUL;
	} else if (Buffer.isBuffer(value)) {
		var name = value.slice(0, 4);
		if (name.compare(BUF_NAME) === 0) {
			return BUF;
		}
		return BIN;
	}
	throw new Error('Value cannot be an object/array');
	//return OBJ;
}

