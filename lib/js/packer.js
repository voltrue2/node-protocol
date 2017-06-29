'use strict';

const type = require('../type.json');
// type size = 1 + key size = 4 is minimum
const MIN_LEN = 1 + 4;
const INT8LEN = 1;
const INT16LEN = 2;
const INT32LEN = 4;
const FLOATLEN = 4;
const DOUBLELEN = 8;

module.exports.pack = pack;
module.exports.unpack = unpack;

/** @description Converts an object into a Buffer
* @params {object} obj - The object to be converted
* @returns {Buffer}
*/
function pack(obj) {
	const list = [];
	if (Array.isArray(obj)) {
		for (var i = 0, len = obj.length; i < len; i++) {
			list.push(packVal(null, obj[i]));
		}
	} else {
		for (const key in obj) {
			list.push(packVal(key, obj[key]));
		}
	}
	return Buffer.concat(list);
}

/** @description Converts a Buffer into an object
* @params {Buffer} buf - The Buffer to be convetered
* @returns {object}
*/
function unpack(buf) {
	const obj = {};
	while (buf.length > MIN_LEN) {
		var unpacked = unpackVal(buf);
		obj[unpacked.key] = unpacked.value;
		buf = buf.slice(unpacked.consumed, buf.length);
	}
	return obj;
}

function packVal(key, val) {
	const type = typeof val;
	switch (type) {
		case 'string':
			return packString(key, val);
		case 'boolean':
			return packBool(key, val);
		case 'number':
			if (val < 0) {
				// signed
				if (val % 1 !== 0) {
					// decimal
					return packFloat(key, val);
				}
				if (val >= -128) {
					return packInt8(key, val);
				} else if (val >= -32768) {
					return packInt16(key, val);
				} else if (val >= -2147483648) {
					return packInt32(key, val);
				}
			} else {
				if (val % 1 !== 0 && val < 0xffffffffffffffff) {
					// decimal
					return packFloat(key, val);
				}
				if (val <= 0xff) {
					return packUInt8(key, val);
				} else if (val <= 0xffff) {
					return packUInt16(key, val);
				} else if (val <= 0xffffffff) {
					return packUInt32(key, val);
				}
				return packDouble(key, val);
			}
		case 'object':
			if (val === null) {
				return packNull(key, val);
			}
			if (Array.isArray(val)) {
				return packArray(key, val);
			}
			return packObject(key, val);
		case 'undefined':
			return packUndefined(key, val);
	}
}

function unpackVal(buf, noKey) {
	const typeIndex = buf.readUInt8(0);
	const typeName = type[typeIndex];
	if (typeName === -1) {
		throw new Error('InvalidDataType');
	}
	switch (typeIndex) {
		case 0:
			return unpackUInt8(buf, noKey);
		case 1:
			return unpackUInt16(buf, noKey);
		case 2:
			return unpackUInt32(buf, noKey);
		case 3:
			return unpackInt8(buf, noKey);
		case 4:
			return unpackInt16(buf, noKey);
		case 5:
			return unpackInt32(buf, noKey);
		case 6:
			return unpackFloat(buf, noKey);
		case 7:
			return unpackDouble(buf, noKey);
		case 8:
			return unpackBool(buf, noKey);
		case 9:
			return unpackArray8(buf, noKey);
		case 10:
			return unpackArray16(buf, noKey);
		case 11:
			return unpackArray32(buf, noKey);
		case 12:
			return unpackObject(buf, noKey);
		case 13:
			return unpackNull(buf, noKey);
		case 14:
			return unpackUndefined(buf, noKey);
		case 15:
			return unpackString8(buf, noKey);
		case 16:
			return unpackString16(buf, noKey);
		case 17:
			return unpackString32(buf, noKey);
	}
}

function packArray(key, arr) {
	const list = [];
	const vlist = [];
	var type;
	var sizeBytes;
	var size = 0;
	for (var i = 0, len = arr.length; i < len; i++) {
		var val = arr[i];
		var buf = packVal(null, val);
		size += buf.length;
		vlist.push(buf);
	}
	if (size <= 0xff) {
		type = 'array8';
		sizeBytes = Buffer.alloc(INT8LEN);
		sizeBytes.writeUInt8(size, 0);
	} else if (size <= 0xffff) {
		type = 'array16';
		sizeBytes = Buffer.alloc(INT16LEN);
		sizeBytes.writeUInt16BE(size, 0);
	} else {
		type = 'array32';
		sizeBytes = Buffer.alloc(INT32LEN);
		sizeBytes.writeUInt32BE(size, 0);
	}
	packKey(list, key, type);
	list.push(sizeBytes);
	return Buffer.concat(list.concat(vlist));
}

function unpackArray8(buf, noKey) {
	const list = [];
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const size = buf.readUInt8(offset);
	offset += INT8LEN;
	var _buf = Buffer.alloc(size);
	buf.copy(_buf, 0, offset, offset + size);
	while (_buf.length) {
		var unpacked = unpackVal(_buf, true);
		list.push(unpacked.value);
		offset += unpacked.consumed;
		_buf = _buf.slice(unpacked.consumed, _buf.length);
	}
	return {
		type: typeName,
		key: key,
		value: list,
		consumed: offset
	};
}

function unpackArray16(buf, noKey) {
	const list = [];
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const size = buf.readUInt16BE(offset);
	offset += INT16LEN;
	var _buf = Buffer.alloc(size);
	buf.copy(_buf, 0, offset, offset + size);
	while (_buf.length) {
		var unpacked = unpackVal(_buf, true);
		list.push(unpacked.value);
		offset += unpacked.consumed;
		_buf = _buf.slice(unpacked.consumed, _buf.length);
	}
	return {
		type: typeName,
		key: key,
		value: list,
		consumed: offset
	};
}

function unpackArray32(buf, noKey) {
	const list = [];
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const size = buf.readUInt32BE(offset);
	offset += INT32LEN;
	var _buf = Buffer.alloc(size);
	buf.copy(_buf, 0, offset, offset + size);
	while (_buf.length) {
		var unpacked = unpackVal(_buf, true);
		list.push(unpacked.value);
		offset += unpacked.consumed;
		_buf = _buf.slice(unpacked.consumed, _buf.length);
	}
	return {
		type: typeName,
		key: key,
		value: list,
		consumed: offset
	};
}

function packObject(key, obj) {
	const list = [];
	packKey(list, key, 'object');
	const sizeBytes = Buffer.alloc(INT32LEN);
	list.push(sizeBytes);
	var size = 0;
	for (const key in obj) {
		var val = obj[key];
		var buf = packVal(key, val);
		size += buf.length;
		list.push(buf);
	}
	sizeBytes.writeUInt32BE(size, 0);
	return Buffer.concat(list);
}

function unpackObject(buf, noKey) {
	const obj = {};
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	// extract val size
	const size = buf.readUInt32BE(offset);
	offset += INT32LEN;
	var _buf = Buffer.alloc(size);
	buf.copy(_buf, 0, offset, offset + size);
	while (_buf.length) {
		var unpacked = unpackVal(_buf);
		obj[unpacked.key] = unpacked.value;
		offset += unpacked.consumed;
		_buf = _buf.slice(unpacked.consumed, _buf.length);
	}
	return {
		type: typeName,
		key: key,
		value: obj,
		consumed: offset
	};
}

function packString(key, val) {
	const list = [];
	const valBytes = Buffer.from(val);
	const vs = valBytes.length;
	var type;
	var valByteSize;
	if (vs <= 0xff) {
		type = 'string8';
		valByteSize = Buffer.alloc(INT8LEN);
		valByteSize.writeUInt8(vs);
	} else if (vs <= 0xffff) {
		type = 'string16';
		valByteSize = Buffer.alloc(INT16LEN);
		valByteSize.writeUInt16BE(vs);
	} else {
		type = 'string32';
		valByteSize = Buffer.alloc(INT32LEN);
		valByteSize.writeUInt32BE(vs);
	}
	packKey(list, key, type);
	list.push(valByteSize);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackString8(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const valByteSize = buf.readUInt8(offset);
	offset += INT8LEN;
	const valBytes = Buffer.alloc(valByteSize);
	buf.copy(valBytes, 0, offset);
	offset += valByteSize;
	return {
		type: typeName,
		key: key,
		value: valBytes.toString(),
		consumed: offset
	};
}

function unpackString16(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const valByteSize = buf.readUInt16BE(offset);
	offset += INT16LEN;
	const valBytes = Buffer.alloc(valByteSize);
	buf.copy(valBytes, 0, offset);
	offset += valByteSize;
	return {
		type: typeName,
		key: key,
		value: valBytes.toString(),
		consumed: offset
	};
}

function unpackString32(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const valByteSize = buf.readUInt32BE(offset);
	offset += INT32LEN;
	const valBytes = Buffer.alloc(valByteSize);
	buf.copy(valBytes, 0, offset);
	offset += valByteSize;
	return {
		type: typeName,
		key: key,
		value: valBytes.toString(),
		consumed: offset
	};
}

function packBool(key, val) {
	val = val === true ? 0x01 : 0x00;
	const list = [];
	packKey(list, key, 'bool');
	const valBytes = Buffer.alloc(INT8LEN).fill(0);
	valBytes.writeUInt8(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackBool(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readUInt8(offset);
	offset += INT8LEN;
	return {
		type: typeName,
		key: key,
		value: val === 0x1 ? true : false,
		consumed: offset
	};
}

function packUInt8(key, val) {
	const list = [];
	packKey(list, key, 'uint8');
	const valBytes = Buffer.alloc(INT8LEN).fill(0);
	valBytes.writeUInt8(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackUInt8(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readUInt8(offset);
	offset += INT8LEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packUInt16(key, val) {
	const list = [];
	packKey(list, key, 'uint16');
	const valBytes = Buffer.alloc(INT16LEN).fill(0);
	valBytes.writeUInt16BE(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackUInt16(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readUInt16BE(offset);
	offset += INT16LEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packUInt32(key, val) {
	const list = [];
	packKey(list, key, 'uint32');
	const valBytes = Buffer.alloc(INT32LEN).fill(0);
	valBytes.writeUInt32BE(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackUInt32(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readUInt32BE(offset);
	offset += INT32LEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packFloat(key, val) {
	const list = [];
	packKey(list, key, 'float');
	const valBytes = Buffer.alloc(FLOATLEN).fill(0);
	valBytes.writeFloatBE(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackFloat(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readFloatBE(offset);
	offset += FLOATLEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packDouble(key, val) {
	const list = [];
	packKey(list, key, 'double');
	const valBytes = Buffer.alloc(DOUBLELEN).fill(0);
	valBytes.writeDoubleBE(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackDouble(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readDoubleBE(offset);
	offset += DOUBLELEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packInt8(key, val) {
	const list = [];
	packKey(list, key, 'int8');
	const valBytes = Buffer.alloc(INT8LEN).fill(0);
	valBytes.writeInt8(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackInt8(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readInt8(offset);
	offset += INT8LEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packInt16(key, val) {
	const list = [];
	packKey(list, key, 'int16');
	const valBytes = Buffer.alloc(INT16LEN).fill(0);
	valBytes.writeInt16BE(val, 0);
	list.push(valBytes);
	const buf = Buffer.concat(list);
	return buf;
}

function unpackInt16(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readInt16BE(offset);
	offset += INT16LEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packInt32(key, val) {
	const list = [];
	packKey(list, key, 'int32');
	const valBytes = Buffer.alloc(INT32LEN).fill(0);
	valBytes.writeInt32BE(val, 0);
	list.push(valBytes);
	return Buffer.concat(list);
}

function unpackInt32(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = buf.readInt32BE(offset);
	offset += INT32LEN;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packNull(key, val) {
	const list = [];
	packKey(list, key, 'null');
	return Buffer.concat(list);
}

function unpackNull(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = null;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packUndefined(key, val) {
	const list = [];
	packKey(list, key, 'undefined');
	return Buffer.concat(list);
}

function unpackUndefined(buf, noKey) {
	const unpackedKey = unpackKey(buf, noKey);
	const typeName = unpackedKey.typeName;
	const key = unpackedKey.key;
	var offset = unpackedKey.offset;
	const val = undefined;
	return {
		type: typeName,
		key: key,
		value: val,
		consumed: offset
	};
}

function packKey(list, key, typeName) {
	if (key) {
		const typeBytes = Buffer.alloc(INT8LEN);
		typeBytes.writeUInt8(type.indexOf(typeName), 0);
		const keyBytes = Buffer.from(key);
		const keySizeBytes = Buffer.alloc(INT8LEN);
		if (keyBytes.length > 0xff) {
			throw new Error('Key length is too large:' + key);
		}
		keySizeBytes.writeUInt8(keyBytes.length, 0);
		list.push(typeBytes);
		list.push(keySizeBytes);
		list.push(keyBytes);
	} else {
		const typeBytes = Buffer.alloc(INT8LEN);
		typeBytes.writeUInt8(type.indexOf(typeName), 0);
		const keySizeBytes = Buffer.alloc(INT8LEN).fill(0);
		list.push(typeBytes);
		list.push(keySizeBytes);
	}
}

function unpackKey(buf, noKey) {
	var offset = 0;
	var key = null;
	const typeIndex = buf.readUInt8(offset);
	const typeName = type[typeIndex];
	offset += 1;
	if (!noKey) {
		const keyByteSize = buf.readUInt8(offset);
		offset += INT8LEN;
		const keyBytes = Buffer.alloc(keyByteSize);
		buf.copy(keyBytes, 0, offset);
		key = keyBytes.toString();
		offset += keyByteSize;
	} else {
		offset += 1;
	}
	return {
		typeName: typeName,
		key: key,
		offset: offset
	};
}

