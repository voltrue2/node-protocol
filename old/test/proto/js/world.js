'use strict';

/* This is the sub struct of "hello" */

const id = 3;
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
		recipients: [],
		message: '',
		sample: {
			id: 0,
			key: '',
			value: '',
			enabled: true,
			sample2list: [],
			_eight: 0,
			_sixteen: 0,
			_thirtytwo: 0,
			datetime: new Date()
		},
		timestamp: 0
	};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	
	var senderUidBytes = Bin.from(obj.senderUid);
	var senderUidSize = senderUidBytes.length;
	var senderUidSizeBytes = Bin.alloc(2);
	senderUidSizeBytes.writeUInt16BE(senderUidSize, 0);
	list.push(senderUidSizeBytes);
	list.push(senderUidBytes);
	// .recipients is an array
	const recipientsLengthBytes = Bin.alloc(2);
	recipientsLengthBytes.writeUInt16BE(obj.recipients.length);
	list.push(recipientsLengthBytes);
	var recipientsIndex = 0;
	var recipientsLen = obj.recipients.length;
	for (var recipientsIndex = 0; recipientsIndex < recipientsLen; recipientsIndex++) {
		var recipientsArrBytes = Bin.from(obj.recipients[recipientsIndex]);
		var recipientsArrSize = recipientsArrBytes.length;
		var recipientsArrSizeBytes = Bin.alloc(2);
		recipientsArrSizeBytes.writeUInt16BE(recipientsArrSize, 0);
		list.push(recipientsArrSizeBytes);
		list.push(recipientsArrBytes);
	}
	var messageBytes = Bin.from(obj.message);
	var messageSize = messageBytes.length;
	var messageSizeBytes = Bin.alloc(2);
	messageSizeBytes.writeUInt16BE(messageSize, 0);
	list.push(messageSizeBytes);
	list.push(messageBytes);

	var sampleIdBytes = Bin.alloc(4);
	sampleIdBytes.writeUInt32BE(obj.sample.id, 0);
	list.push(sampleIdBytes);
	var sampleKeyBytes = Bin.from(obj.sample.key);
	var sampleKeySize = sampleKeyBytes.length;
	var sampleKeySizeBytes = Bin.alloc(2);
	sampleKeySizeBytes.writeUInt16BE(sampleKeySize, 0);
	list.push(sampleKeySizeBytes);
	list.push(sampleKeyBytes);
	var sampleValueBytes = Bin.from(obj.sample.value);
	var sampleValueSize = sampleValueBytes.length;
	var sampleValueSizeBytes = Bin.alloc(2);
	sampleValueSizeBytes.writeUInt16BE(sampleValueSize, 0);
	list.push(sampleValueSizeBytes);
	list.push(sampleValueBytes);
	var sampleEnabledBytes = Bin.alloc(1);
	sampleEnabledBytes.writeUInt8(obj.sample.enabled ? 0x01 : 0x00);
	list.push(sampleEnabledBytes);
	// .sample.sample2list is an array
	const sampleSample2listLengthBytes = Bin.alloc(2);
	sampleSample2listLengthBytes.writeUInt16BE(obj.sample.sample2list.length);
	list.push(sampleSample2listLengthBytes);
	var sampleSample2listIndex = 0;
	var sampleSample2listLen = obj.sample.sample2list.length;
	for (var sampleSample2listIndex = 0; sampleSample2listIndex < sampleSample2listLen; sampleSample2listIndex++) {

		var sampleSample2listNameBytes = Bin.from(obj.sample.sample2list[sampleSample2listIndex].name);
		var sampleSample2listNameSize = sampleSample2listNameBytes.length;
		var sampleSample2listNameSizeBytes = Bin.alloc(2);
		sampleSample2listNameSizeBytes.writeUInt16BE(sampleSample2listNameSize, 0);
		list.push(sampleSample2listNameSizeBytes);
		list.push(sampleSample2listNameBytes);
	}
	var sample_eightBytes = Bin.alloc(1);
	sample_eightBytes.writeInt8(obj.sample._eight, 0);
	list.push(sample_eightBytes);
	var sample_sixteenBytes = Bin.alloc(2);
	sample_sixteenBytes.writeInt16LE(obj.sample._sixteen, 0);
	list.push(sample_sixteenBytes);
	var sample_thirtytwoBytes = Bin.alloc(4);
	sample_thirtytwoBytes.writeInt32LE(obj.sample._thirtytwo, 0);
	list.push(sample_thirtytwoBytes);
	var sampleDatetimeBytes = Bin.alloc(8);
	sampleDatetimeBytes.writeDoubleBE(obj.sample.datetime.getTime(), 0);
	list.push(sampleDatetimeBytes);
	var timestampBytes = Bin.alloc(4);
	timestampBytes.writeUInt32BE(obj.timestamp, 0);
	list.push(timestampBytes);

	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	
	var offset = 0;
	// unpack for obj.senderUid
	var senderUidSize = buf.readUInt16BE(offset);
	offset += 2;
	var senderUidBytes = Bin.alloc(senderUidSize);
	buf.copy(senderUidBytes, 0, offset);
	offset += senderUidSize;
	obj.senderUid = senderUidBytes.toString();
	// unpack for obj.recipients
	obj.recipients = [];
	var recipientsLength = buf.readUInt16BE(offset);
	offset += 2;
	var recipientsLen = recipientsLength;
	for (var recipientsIndex = 0; recipientsIndex < recipientsLength; recipientsIndex++) {
		var recipientsArrSize = buf.readUInt16BE(offset);
		offset += 2;
		var recipientsArrBytes = Bin.alloc(recipientsArrSize);
		buf.copy(recipientsArrBytes, 0, offset);
		offset += recipientsArrSize;
		obj.recipients.push(recipientsArrBytes.toString());
	}
	// unpack for obj.message
	var messageSize = buf.readUInt16BE(offset);
	offset += 2;
	var messageBytes = Bin.alloc(messageSize);
	buf.copy(messageBytes, 0, offset);
	offset += messageSize;
	obj.message = messageBytes.toString();
	// Sample parameter

	obj.sample = {};
	// Unique ID
	obj.sample.id = buf.readUInt32BE(offset);
	offset += 4;
	// unpack for obj.sample.key
	var sampleKeySize = buf.readUInt16BE(offset);
	offset += 2;
	var sampleKeyBytes = Bin.alloc(sampleKeySize);
	buf.copy(sampleKeyBytes, 0, offset);
	offset += sampleKeySize;
	obj.sample.key = sampleKeyBytes.toString();
	// Probably JSON
	var sampleValueSize = buf.readUInt16BE(offset);
	offset += 2;
	var sampleValueBytes = Bin.alloc(sampleValueSize);
	buf.copy(sampleValueBytes, 0, offset);
	offset += sampleValueSize;
	obj.sample.value = sampleValueBytes.toString();
	// unpack for obj.sample.enabled
	obj.sample.enabled = buf.readUInt8(offset) === 0x01 ? true : false;
	offset += 1;
	// unpack for obj.sample.sample2list
	obj.sample.sample2list = [];
	var sampleSample2listLength = buf.readUInt16BE(offset);
	offset += 2;
	var sampleSample2listLen = sampleSample2listLength;
	for (var sampleSample2listIndex = 0; sampleSample2listIndex < sampleSample2listLength; sampleSample2listIndex++) {

		obj.sample.sample2list[sampleSample2listIndex] = {};
		// unpack for obj.sample.sample2list.name
		var sampleSample2listNameSize = buf.readUInt16BE(offset);
		offset += 2;
		var sampleSample2listNameBytes = Bin.alloc(sampleSample2listNameSize);
		buf.copy(sampleSample2listNameBytes, 0, offset);
		offset += sampleSample2listNameSize;
		obj.sample.sample2list[sampleSample2listIndex].name = sampleSample2listNameBytes.toString();
	}
	// unpack for obj.sample._eight
	obj.sample._eight = buf.readInt8(offset);
	offset += 1;
	// unpack for obj.sample._sixteen
	obj.sample._sixteen = buf.readInt16LE(offset);
	offset += 2;
	// unpack for obj.sample._thirtytwo
	obj.sample._thirtytwo = buf.readInt32LE(offset);
	offset += 4;
	// Date time object
	obj.sample.datetime = new Date(buf.readDoubleBE(offset));
	offset += 8;
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

