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
	const idBytes = Bin.alloc(4);
	idBytes.writeUInt32BE(obj.id);
	// pack key
	const keyBytes = Bin.from(obj.key);
	const keySize = keyBytes.length;
	const keySizeBytes = Bin.alloc(2);
	keySizeBytes.writeUInt16BE(keySize, 0);
	list.push(keySizeBytes);
	list.push(keyBytes);
	// Probably JSON
	const valueBytes = Bin.from(obj.value);
	const valueSize = valueBytes.length;
	const valueSizeBytes = Bin.alloc(2);
	valueSizeBytes.writeUInt16BE(valueSize, 0);
	list.push(valueSizeBytes);
	list.push(valueBytes);
	// pack enabled
	const enabledBytes = Bin.alloc(1);
	enabledBytes.writeUInt8(obj.enabled ? 0x01 : 0x00);

	return Buffer.concat(list);
}

function unpack() {

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
	return new Buffer(size);
}

