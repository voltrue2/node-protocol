'use strict';

/* This is the sub struct of "hello" */

const id = 2;
const name = 'world';

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
		senderUid: '',
		recipients: '',
		message: '',
		sample: {
			id: 0,
			key: '',
			value: '',
			enabled: true
		},
		timestamp: 0
	};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	
	// pack .senderUid
	if (obj.senderUid === null || obj.senderUid === undefined) {
		throw new Error('obj.senderUid cannot be null or undefined');
	}
	const senderUidBytes = Bin.from(obj.senderUid);
	const senderUidSize = senderUidBytes.length;
	const senderUidSizeBytes = Bin.alloc(2);
	senderUidSizeBytes.writeUInt16BE(senderUidSize, 0);
	list.push(senderUidSizeBytes);
	list.push(senderUidBytes);
	// pack .recipients
	if (obj.recipients === null || obj.recipients === undefined) {
		throw new Error('obj.recipients cannot be null or undefined');
	}
	const recipientsBytes = Bin.from(obj.recipients);
	const recipientsSize = recipientsBytes.length;
	const recipientsSizeBytes = Bin.alloc(2);
	recipientsSizeBytes.writeUInt16BE(recipientsSize, 0);
	list.push(recipientsSizeBytes);
	list.push(recipientsBytes);
	// pack .message
	if (obj.message === null || obj.message === undefined) {
		throw new Error('obj.message cannot be null or undefined');
	}
	const messageBytes = Bin.from(obj.message);
	const messageSize = messageBytes.length;
	const messageSizeBytes = Bin.alloc(2);
	messageSizeBytes.writeUInt16BE(messageSize, 0);
	list.push(messageSizeBytes);
	list.push(messageBytes);
	// Sample parameter
	if (obj.sample === null || obj.sample === undefined) {
		throw new Error('obj.sample cannot be null or undefined');
	}

	// Unique ID
	if (obj.sample.id === null || obj.sample.id === undefined) {
		throw new Error('obj.sample.id cannot be null or undefined');
	}
	const sampleidBytes = Bin.alloc(4);
	sampleidBytes.writeUInt32BE(obj.sample.id, 0);
	list.push(sampleidBytes);
	// pack .sample.key
	if (obj.sample.key === null || obj.sample.key === undefined) {
		throw new Error('obj.sample.key cannot be null or undefined');
	}
	const samplekeyBytes = Bin.from(obj.sample.key);
	const samplekeySize = samplekeyBytes.length;
	const samplekeySizeBytes = Bin.alloc(2);
	samplekeySizeBytes.writeUInt16BE(samplekeySize, 0);
	list.push(samplekeySizeBytes);
	list.push(samplekeyBytes);
	// Probably JSON
	if (obj.sample.value === null || obj.sample.value === undefined) {
		throw new Error('obj.sample.value cannot be null or undefined');
	}
	const samplevalueBytes = Bin.from(obj.sample.value);
	const samplevalueSize = samplevalueBytes.length;
	const samplevalueSizeBytes = Bin.alloc(2);
	samplevalueSizeBytes.writeUInt16BE(samplevalueSize, 0);
	list.push(samplevalueSizeBytes);
	list.push(samplevalueBytes);
	// pack .sample.enabled
	if (obj.sample.enabled === null || obj.sample.enabled === undefined) {
		throw new Error('obj.sample.enabled cannot be null or undefined');
	}
	const sampleenabledBytes = Bin.alloc(1);
	sampleenabledBytes.writeUInt8(obj.sample.enabled ? 0x01 : 0x00);
	list.push(sampleenabledBytes);
	// pack .timestamp
	if (obj.timestamp === null || obj.timestamp === undefined) {
		throw new Error('obj.timestamp cannot be null or undefined');
	}
	const timestampBytes = Bin.alloc(4);
	timestampBytes.writeUInt32BE(obj.timestamp, 0);
	list.push(timestampBytes);

	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	
	var offset = 0;
	// unpack for obj.senderUid
	const senderUidSize = buf.readUInt16BE(offset);
	offset += 2;
	const senderUidBytes = Bin.alloc(senderUidSize);
	buf.copy(senderUidBytes, 0, offset);
	offset += senderUidSize;
	obj.senderUid = senderUidBytes.toString();
	// unpack for obj.recipients
	const recipientsSize = buf.readUInt16BE(offset);
	offset += 2;
	const recipientsBytes = Bin.alloc(recipientsSize);
	buf.copy(recipientsBytes, 0, offset);
	offset += recipientsSize;
	obj.recipients = recipientsBytes.toString();
	// unpack for obj.message
	const messageSize = buf.readUInt16BE(offset);
	offset += 2;
	const messageBytes = Bin.alloc(messageSize);
	buf.copy(messageBytes, 0, offset);
	offset += messageSize;
	obj.message = messageBytes.toString();
	// Sample parameter

	obj.sample = {};
	// Unique ID
	obj.sample.id = buf.readUInt32BE(offset);
	offset += 4;
	// unpack for obj.sample.key
	const samplekeySize = buf.readUInt16BE(offset);
	offset += 2;
	const samplekeyBytes = Bin.alloc(samplekeySize);
	buf.copy(samplekeyBytes, 0, offset);
	offset += samplekeySize;
	obj.sample.key = samplekeyBytes.toString();
	// Probably JSON
	const samplevalueSize = buf.readUInt16BE(offset);
	offset += 2;
	const samplevalueBytes = Bin.alloc(samplevalueSize);
	buf.copy(samplevalueBytes, 0, offset);
	offset += samplevalueSize;
	obj.sample.value = samplevalueBytes.toString();
	// unpack for obj.sample.enabled
	obj.sample.enabled = buf.readUInt8(offset) === 0x01 ? true : false;
	offset += 1;
	// unpack for obj.timestamp
	obj.timestamp = buf.readUInt32BE(offset);
	offset += 4;

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

