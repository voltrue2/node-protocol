'use strict';



const name = 'sample1';

module.exports.name = getName;
module.exports.create = create;
module.exports.pack = pack;
module.exports.unpack = unpack;

function getName() {
	return name;
}

function create() {
	return {
		id: 0,
		key: '',
		value: '',
		enabled: true
	};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	
	// Unique ID
	if (obj.id === null || obj.id === undefined) {
		throw new Error('obj.id cannot be null or undefined');
	}
	const idBytes = Bin.alloc(4);
	idBytes.writeUInt32BE(obj.id, 0);
	list.push(idBytes);
	// pack .key
	if (obj.key === null || obj.key === undefined) {
		throw new Error('obj.key cannot be null or undefined');
	}
	const keyBytes = Bin.from(obj.key);
	const keySize = keyBytes.length;
	const keySizeBytes = Bin.alloc(2);
	keySizeBytes.writeUInt16BE(keySize, 0);
	list.push(keySizeBytes);
	list.push(keyBytes);
	// Probably JSON
	if (obj.value === null || obj.value === undefined) {
		throw new Error('obj.value cannot be null or undefined');
	}
	const valueBytes = Bin.from(obj.value);
	const valueSize = valueBytes.length;
	const valueSizeBytes = Bin.alloc(2);
	valueSizeBytes.writeUInt16BE(valueSize, 0);
	list.push(valueSizeBytes);
	list.push(valueBytes);
	// pack .enabled
	if (obj.enabled === null || obj.enabled === undefined) {
		throw new Error('obj.enabled cannot be null or undefined');
	}
	const enabledBytes = Bin.alloc(1);
	enabledBytes.writeUInt8(obj.enabled ? 0x01 : 0x00);
	list.push(enabledBytes);

	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	
	var offset = 0;
	// Unique ID
	obj.id = buf.readUInt32BE(offset);
	offset += 4;
	// unpack for obj.key
	const keySize = buf.readUInt16BE(offset);
	offset += 2;
	const keyBytes = Bin.alloc(keySize);
	buf.copy(keyBytes, 0, offset);
	offset += keySize;
	obj.key = keyBytes.toString();
	// Probably JSON
	const valueSize = buf.readUInt16BE(offset);
	offset += 2;
	const valueBytes = Bin.alloc(valueSize);
	buf.copy(valueBytes, 0, offset);
	offset += valueSize;
	obj.value = valueBytes.toString();
	// unpack for obj.enabled
	obj.enabled = buf.readUInt8(offset) === 0x01 ? true : false;
	offset += 1;

	return obj;
}

// Buffer handler static object Bin: Bin.from(<string>) and Bin.alloc(<size>)
const __methods = {
	from: null,
	alloc: null
};

getNodeVersion();

const Bin = {
	from: __methods.from,
	alloc: __methods.alloc
};

function getNodeVersion() {
	const vstring = process.version.replace('v', '');
	const v = parseInt(vstring.substring(0, vstring.indexOf('.')));
	if (v >= 7) {
		// version 7 or higher
		__methods.from = from;
		__methods.alloc = alloc;
	} else {
		__methods.from = oldFrom;
		__methods.alloc = oldAlloc;
	}
}

function from(str, enc) {
	return Buffer.from(str, enc);
}

function alloc(size) {
	return Buffer.alloc(size).fill(0);
}

function oldFrom(str, enc) {
	return new Buffer(str, enc);
}

function oldAlloc(size) {
	const buf = new Buffer(size);
	buf.fill(0);
	return buf;
}

