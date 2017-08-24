'use strict';

const id = 2;
const name = 'hello';

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
		timelist: [],
		uid: '',
		message: {
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
		}
	};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	
	// .timelist is an array
	const timelistLengthBytes = Bin.alloc(2);
	timelistLengthBytes.writeUInt16BE(obj.timelist.length);
	list.push(timelistLengthBytes);
	var timelistIndex = 0;
	var timelistLen = obj.timelist.length;
	for (var timelistIndex = 0; timelistIndex < timelistLen; timelistIndex++) {
		var timelistArrBytes = Bin.alloc(8);
		timelistArrBytes.writeDoubleBE(obj.timelist[timelistIndex].getTime(), 0);
		list.push(timelistArrBytes);
	}
	var uidBytes = Bin.from(obj.uid);
	var uidSize = uidBytes.length;
	var uidSizeBytes = Bin.alloc(2);
	uidSizeBytes.writeUInt16BE(uidSize, 0);
	list.push(uidSizeBytes);
	list.push(uidBytes);

	var messageSenderUidBytes = Bin.from(obj.message.senderUid);
	var messageSenderUidSize = messageSenderUidBytes.length;
	var messageSenderUidSizeBytes = Bin.alloc(2);
	messageSenderUidSizeBytes.writeUInt16BE(messageSenderUidSize, 0);
	list.push(messageSenderUidSizeBytes);
	list.push(messageSenderUidBytes);
	// .message.recipients is an array
	const messageRecipientsLengthBytes = Bin.alloc(2);
	messageRecipientsLengthBytes.writeUInt16BE(obj.message.recipients.length);
	list.push(messageRecipientsLengthBytes);
	var messageRecipientsIndex = 0;
	var messageRecipientsLen = obj.message.recipients.length;
	for (var messageRecipientsIndex = 0; messageRecipientsIndex < messageRecipientsLen; messageRecipientsIndex++) {
		var messageRecipientsArrBytes = Bin.from(obj.message.recipients[messageRecipientsIndex]);
		var messageRecipientsArrSize = messageRecipientsArrBytes.length;
		var messageRecipientsArrSizeBytes = Bin.alloc(2);
		messageRecipientsArrSizeBytes.writeUInt16BE(messageRecipientsArrSize, 0);
		list.push(messageRecipientsArrSizeBytes);
		list.push(messageRecipientsArrBytes);
	}
	var messageMessageBytes = Bin.from(obj.message.message);
	var messageMessageSize = messageMessageBytes.length;
	var messageMessageSizeBytes = Bin.alloc(2);
	messageMessageSizeBytes.writeUInt16BE(messageMessageSize, 0);
	list.push(messageMessageSizeBytes);
	list.push(messageMessageBytes);

	var messageSampleIdBytes = Bin.alloc(4);
	messageSampleIdBytes.writeUInt32BE(obj.message.sample.id, 0);
	list.push(messageSampleIdBytes);
	var messageSampleKeyBytes = Bin.from(obj.message.sample.key);
	var messageSampleKeySize = messageSampleKeyBytes.length;
	var messageSampleKeySizeBytes = Bin.alloc(2);
	messageSampleKeySizeBytes.writeUInt16BE(messageSampleKeySize, 0);
	list.push(messageSampleKeySizeBytes);
	list.push(messageSampleKeyBytes);
	var messageSampleValueBytes = Bin.from(obj.message.sample.value);
	var messageSampleValueSize = messageSampleValueBytes.length;
	var messageSampleValueSizeBytes = Bin.alloc(2);
	messageSampleValueSizeBytes.writeUInt16BE(messageSampleValueSize, 0);
	list.push(messageSampleValueSizeBytes);
	list.push(messageSampleValueBytes);
	var messageSampleEnabledBytes = Bin.alloc(1);
	messageSampleEnabledBytes.writeUInt8(obj.message.sample.enabled ? 0x01 : 0x00);
	list.push(messageSampleEnabledBytes);
	// .message.sample.sample2list is an array
	const messageSampleSample2listLengthBytes = Bin.alloc(2);
	messageSampleSample2listLengthBytes.writeUInt16BE(obj.message.sample.sample2list.length);
	list.push(messageSampleSample2listLengthBytes);
	var messageSampleSample2listIndex = 0;
	var messageSampleSample2listLen = obj.message.sample.sample2list.length;
	for (var messageSampleSample2listIndex = 0; messageSampleSample2listIndex < messageSampleSample2listLen; messageSampleSample2listIndex++) {

		var messageSampleSample2listNameBytes = Bin.from(obj.message.sample.sample2list[messageSampleSample2listIndex].name);
		var messageSampleSample2listNameSize = messageSampleSample2listNameBytes.length;
		var messageSampleSample2listNameSizeBytes = Bin.alloc(2);
		messageSampleSample2listNameSizeBytes.writeUInt16BE(messageSampleSample2listNameSize, 0);
		list.push(messageSampleSample2listNameSizeBytes);
		list.push(messageSampleSample2listNameBytes);
	}
	var messageSample_eightBytes = Bin.alloc(1);
	messageSample_eightBytes.writeInt8(obj.message.sample._eight, 0);
	list.push(messageSample_eightBytes);
	var messageSample_sixteenBytes = Bin.alloc(2);
	messageSample_sixteenBytes.writeInt16LE(obj.message.sample._sixteen, 0);
	list.push(messageSample_sixteenBytes);
	var messageSample_thirtytwoBytes = Bin.alloc(4);
	messageSample_thirtytwoBytes.writeInt32LE(obj.message.sample._thirtytwo, 0);
	list.push(messageSample_thirtytwoBytes);
	var messageSampleDatetimeBytes = Bin.alloc(8);
	messageSampleDatetimeBytes.writeDoubleBE(obj.message.sample.datetime.getTime(), 0);
	list.push(messageSampleDatetimeBytes);
	var messageTimestampBytes = Bin.alloc(4);
	messageTimestampBytes.writeUInt32BE(obj.message.timestamp, 0);
	list.push(messageTimestampBytes);

	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	
	var offset = 0;
	// unpack for obj.timelist
	obj.timelist = [];
	var timelistLength = buf.readUInt16BE(offset);
	offset += 2;
	var timelistLen = timelistLength;
	for (var timelistIndex = 0; timelistIndex < timelistLength; timelistIndex++) {
		obj.timelist.push(new Date(buf.readDoubleBE(offset)));
		offset += 8;
	}
	// unpack for obj.uid
	var uidSize = buf.readUInt16BE(offset);
	offset += 2;
	var uidBytes = Bin.alloc(uidSize);
	buf.copy(uidBytes, 0, offset);
	offset += uidSize;
	obj.uid = uidBytes.toString();
	// unpack for obj.message

	obj.message = {};
	// unpack for obj.message.senderUid
	var messageSenderUidSize = buf.readUInt16BE(offset);
	offset += 2;
	var messageSenderUidBytes = Bin.alloc(messageSenderUidSize);
	buf.copy(messageSenderUidBytes, 0, offset);
	offset += messageSenderUidSize;
	obj.message.senderUid = messageSenderUidBytes.toString();
	// unpack for obj.message.recipients
	obj.message.recipients = [];
	var messageRecipientsLength = buf.readUInt16BE(offset);
	offset += 2;
	var messageRecipientsLen = messageRecipientsLength;
	for (var messageRecipientsIndex = 0; messageRecipientsIndex < messageRecipientsLength; messageRecipientsIndex++) {
		var messageRecipientsArrSize = buf.readUInt16BE(offset);
		offset += 2;
		var messageRecipientsArrBytes = Bin.alloc(messageRecipientsArrSize);
		buf.copy(messageRecipientsArrBytes, 0, offset);
		offset += messageRecipientsArrSize;
		obj.message.recipients.push(messageRecipientsArrBytes.toString());
	}
	// unpack for obj.message.message
	var messageMessageSize = buf.readUInt16BE(offset);
	offset += 2;
	var messageMessageBytes = Bin.alloc(messageMessageSize);
	buf.copy(messageMessageBytes, 0, offset);
	offset += messageMessageSize;
	obj.message.message = messageMessageBytes.toString();
	// Sample parameter

	obj.message.sample = {};
	// Unique ID
	obj.message.sample.id = buf.readUInt32BE(offset);
	offset += 4;
	// unpack for obj.message.sample.key
	var messageSampleKeySize = buf.readUInt16BE(offset);
	offset += 2;
	var messageSampleKeyBytes = Bin.alloc(messageSampleKeySize);
	buf.copy(messageSampleKeyBytes, 0, offset);
	offset += messageSampleKeySize;
	obj.message.sample.key = messageSampleKeyBytes.toString();
	// Probably JSON
	var messageSampleValueSize = buf.readUInt16BE(offset);
	offset += 2;
	var messageSampleValueBytes = Bin.alloc(messageSampleValueSize);
	buf.copy(messageSampleValueBytes, 0, offset);
	offset += messageSampleValueSize;
	obj.message.sample.value = messageSampleValueBytes.toString();
	// unpack for obj.message.sample.enabled
	obj.message.sample.enabled = buf.readUInt8(offset) === 0x01 ? true : false;
	offset += 1;
	// unpack for obj.message.sample.sample2list
	obj.message.sample.sample2list = [];
	var messageSampleSample2listLength = buf.readUInt16BE(offset);
	offset += 2;
	var messageSampleSample2listLen = messageSampleSample2listLength;
	for (var messageSampleSample2listIndex = 0; messageSampleSample2listIndex < messageSampleSample2listLength; messageSampleSample2listIndex++) {

		obj.message.sample.sample2list[messageSampleSample2listIndex] = {};
		// unpack for obj.message.sample.sample2list.name
		var messageSampleSample2listNameSize = buf.readUInt16BE(offset);
		offset += 2;
		var messageSampleSample2listNameBytes = Bin.alloc(messageSampleSample2listNameSize);
		buf.copy(messageSampleSample2listNameBytes, 0, offset);
		offset += messageSampleSample2listNameSize;
		obj.message.sample.sample2list[messageSampleSample2listIndex].name = messageSampleSample2listNameBytes.toString();
	}
	// unpack for obj.message.sample._eight
	obj.message.sample._eight = buf.readInt8(offset);
	offset += 1;
	// unpack for obj.message.sample._sixteen
	obj.message.sample._sixteen = buf.readInt16LE(offset);
	offset += 2;
	// unpack for obj.message.sample._thirtytwo
	obj.message.sample._thirtytwo = buf.readInt32LE(offset);
	offset += 4;
	// Date time object
	obj.message.sample.datetime = new Date(buf.readDoubleBE(offset));
	offset += 8;
	// unpack for obj.message.timestamp
	obj.message.timestamp = buf.readUInt32BE(offset);
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

