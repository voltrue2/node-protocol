'use strict';

const id = 0;
const name = 'sample1';

module.exports.getId = getId;
module.exports.name = getName;
module.exports.create = create;
module.exports.pack = pack;
module.exports.unpack = unpack;

function getId() {
	return id;
}

function getName() {
	return name;
}

function create() {
	return {
		id: 0,
		key: '',
		value: '',
		enabled: true,
		sample2list: [],
		_eight: 0,
		_sixteen: 0,
		_thirtytwo: 0,
		datetime: new Date()
	};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	
	var idBytes = Bin.alloc(4);
	idBytes.writeUInt32BE(obj.id, 0);
	list.push(idBytes);
	var keyBytes = Bin.from(obj.key);
	var keySize = keyBytes.length;
	var keySizeBytes = Bin.alloc(2);
	keySizeBytes.writeUInt16BE(keySize, 0);
	list.push(keySizeBytes);
	list.push(keyBytes);
	var valueBytes = Bin.from(obj.value);
	var valueSize = valueBytes.length;
	var valueSizeBytes = Bin.alloc(2);
	valueSizeBytes.writeUInt16BE(valueSize, 0);
	list.push(valueSizeBytes);
	list.push(valueBytes);
	var enabledBytes = Bin.alloc(1);
	enabledBytes.writeUInt8(obj.enabled ? 0x01 : 0x00);
	list.push(enabledBytes);
	// .sample2list is an array
	const sample2listLengthBytes = Bin.alloc(2);
	sample2listLengthBytes.writeUInt16BE(obj.sample2list.length);
	list.push(sample2listLengthBytes);
	var sample2listIndex = 0;
	var sample2listLen = obj.sample2list.length;
	for (var sample2listIndex = 0; sample2listIndex < sample2listLen; sample2listIndex++) {

		var sample2listNameBytes = Bin.from(obj.sample2list[sample2listIndex].name);
		var sample2listNameSize = sample2listNameBytes.length;
		var sample2listNameSizeBytes = Bin.alloc(2);
		sample2listNameSizeBytes.writeUInt16BE(sample2listNameSize, 0);
		list.push(sample2listNameSizeBytes);
		list.push(sample2listNameBytes);
	}
	var _eightBytes = Bin.alloc(1);
	_eightBytes.writeInt8(obj._eight, 0);
	list.push(_eightBytes);
	var _sixteenBytes = Bin.alloc(2);
	_sixteenBytes.writeInt16LE(obj._sixteen, 0);
	list.push(_sixteenBytes);
	var _thirtytwoBytes = Bin.alloc(4);
	_thirtytwoBytes.writeInt32LE(obj._thirtytwo, 0);
	list.push(_thirtytwoBytes);
	var datetimeBytes = Bin.alloc(8);
	datetimeBytes.writeDoubleBE(obj.datetime.getTime(), 0);
	list.push(datetimeBytes);

	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	
	var offset = 0;
	// Unique ID
	obj.id = buf.readUInt32BE(offset);
	offset += 4;
	// unpack for obj.key
	var keySize = buf.readUInt16BE(offset);
	offset += 2;
	var keyBytes = Bin.alloc(keySize);
	buf.copy(keyBytes, 0, offset);
	offset += keySize;
	obj.key = keyBytes.toString();
	// Probably JSON
	var valueSize = buf.readUInt16BE(offset);
	offset += 2;
	var valueBytes = Bin.alloc(valueSize);
	buf.copy(valueBytes, 0, offset);
	offset += valueSize;
	obj.value = valueBytes.toString();
	// unpack for obj.enabled
	obj.enabled = buf.readUInt8(offset) === 0x01 ? true : false;
	offset += 1;
	// unpack for obj.sample2list
	obj.sample2list = [];
	var sample2listLength = buf.readUInt16BE(offset);
	offset += 2;
	var sample2listLen = sample2listLength;
	for (var sample2listIndex = 0; sample2listIndex < sample2listLength; sample2listIndex++) {

		obj.sample2list[sample2listIndex] = {};
		// unpack for obj.sample2list.name
		var sample2listNameSize = buf.readUInt16BE(offset);
		offset += 2;
		var sample2listNameBytes = Bin.alloc(sample2listNameSize);
		buf.copy(sample2listNameBytes, 0, offset);
		offset += sample2listNameSize;
		obj.sample2list[sample2listIndex].name = sample2listNameBytes.toString();
	}
	// unpack for obj._eight
	obj._eight = buf.readInt8(offset);
	offset += 1;
	// unpack for obj._sixteen
	obj._sixteen = buf.readInt16LE(offset);
	offset += 2;
	// unpack for obj._thirtytwo
	obj._thirtytwo = buf.readInt32LE(offset);
	offset += 4;
	// Date time object
	obj.datetime = new Date(buf.readDoubleBE(offset));
	offset += 8;

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

