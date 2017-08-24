'use strict';

const id = 1;
const name = 'sample2';

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
		name: ''
	};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	
	var nameBytes = Bin.from(obj.name);
	var nameSize = nameBytes.length;
	var nameSizeBytes = Bin.alloc(2);
	nameSizeBytes.writeUInt16BE(nameSize, 0);
	list.push(nameSizeBytes);
	list.push(nameBytes);

	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	
	var offset = 0;
	// unpack for obj.name
	var nameSize = buf.readUInt16BE(offset);
	offset += 2;
	var nameBytes = Bin.alloc(nameSize);
	buf.copy(nameBytes, 0, offset);
	offset += nameSize;
	obj.name = nameBytes.toString();

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

