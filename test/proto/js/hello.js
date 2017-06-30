'use strict';



const id = 1;
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
		uid: '',
		message: {
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
		}
	};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	
	// pack .uid
	if (obj.uid === null || obj.uid === undefined) {
		throw new Error('obj.uid cannot be null or undefined');
	}
	const uidBytes = Bin.from(obj.uid);
	const uidSize = uidBytes.length;
	const uidSizeBytes = Bin.alloc(2);
	uidSizeBytes.writeUInt16BE(uidSize, 0);
	list.push(uidSizeBytes);
	list.push(uidBytes);
	// pack .message
	if (obj.message === null || obj.message === undefined) {
		throw new Error('obj.message cannot be null or undefined');
	}

	// pack .message.senderUid
	if (obj.message.senderUid === null || obj.message.senderUid === undefined) {
		throw new Error('obj.message.senderUid cannot be null or undefined');
	}
	const messagesenderUidBytes = Bin.from(obj.message.senderUid);
	const messagesenderUidSize = messagesenderUidBytes.length;
	const messagesenderUidSizeBytes = Bin.alloc(2);
	messagesenderUidSizeBytes.writeUInt16BE(messagesenderUidSize, 0);
	list.push(messagesenderUidSizeBytes);
	list.push(messagesenderUidBytes);
	// pack .message.recipients
	if (obj.message.recipients === null || obj.message.recipients === undefined) {
		throw new Error('obj.message.recipients cannot be null or undefined');
	}
	const messagerecipientsBytes = Bin.from(obj.message.recipients);
	const messagerecipientsSize = messagerecipientsBytes.length;
	const messagerecipientsSizeBytes = Bin.alloc(2);
	messagerecipientsSizeBytes.writeUInt16BE(messagerecipientsSize, 0);
	list.push(messagerecipientsSizeBytes);
	list.push(messagerecipientsBytes);
	// pack .message.message
	if (obj.message.message === null || obj.message.message === undefined) {
		throw new Error('obj.message.message cannot be null or undefined');
	}
	const messagemessageBytes = Bin.from(obj.message.message);
	const messagemessageSize = messagemessageBytes.length;
	const messagemessageSizeBytes = Bin.alloc(2);
	messagemessageSizeBytes.writeUInt16BE(messagemessageSize, 0);
	list.push(messagemessageSizeBytes);
	list.push(messagemessageBytes);
	// Sample parameter
	if (obj.message.sample === null || obj.message.sample === undefined) {
		throw new Error('obj.message.sample cannot be null or undefined');
	}

	// Unique ID
	if (obj.message.sample.id === null || obj.message.sample.id === undefined) {
		throw new Error('obj.message.sample.id cannot be null or undefined');
	}
	const messagesampleidBytes = Bin.alloc(4);
	messagesampleidBytes.writeUInt32BE(obj.message.sample.id, 0);
	list.push(messagesampleidBytes);
	// pack .message.sample.key
	if (obj.message.sample.key === null || obj.message.sample.key === undefined) {
		throw new Error('obj.message.sample.key cannot be null or undefined');
	}
	const messagesamplekeyBytes = Bin.from(obj.message.sample.key);
	const messagesamplekeySize = messagesamplekeyBytes.length;
	const messagesamplekeySizeBytes = Bin.alloc(2);
	messagesamplekeySizeBytes.writeUInt16BE(messagesamplekeySize, 0);
	list.push(messagesamplekeySizeBytes);
	list.push(messagesamplekeyBytes);
	// Probably JSON
	if (obj.message.sample.value === null || obj.message.sample.value === undefined) {
		throw new Error('obj.message.sample.value cannot be null or undefined');
	}
	const messagesamplevalueBytes = Bin.from(obj.message.sample.value);
	const messagesamplevalueSize = messagesamplevalueBytes.length;
	const messagesamplevalueSizeBytes = Bin.alloc(2);
	messagesamplevalueSizeBytes.writeUInt16BE(messagesamplevalueSize, 0);
	list.push(messagesamplevalueSizeBytes);
	list.push(messagesamplevalueBytes);
	// pack .message.sample.enabled
	if (obj.message.sample.enabled === null || obj.message.sample.enabled === undefined) {
		throw new Error('obj.message.sample.enabled cannot be null or undefined');
	}
	const messagesampleenabledBytes = Bin.alloc(1);
	messagesampleenabledBytes.writeUInt8(obj.message.sample.enabled ? 0x01 : 0x00);
	list.push(messagesampleenabledBytes);
	// pack .message.timestamp
	if (obj.message.timestamp === null || obj.message.timestamp === undefined) {
		throw new Error('obj.message.timestamp cannot be null or undefined');
	}
	const messagetimestampBytes = Bin.alloc(4);
	messagetimestampBytes.writeUInt32BE(obj.message.timestamp, 0);
	list.push(messagetimestampBytes);

	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	
	var offset = 0;
	// unpack for obj.uid
	const uidSize = buf.readUInt16BE(offset);
	offset += 2;
	const uidBytes = Bin.alloc(uidSize);
	buf.copy(uidBytes, 0, offset);
	offset += uidSize;
	obj.uid = uidBytes.toString();
	// unpack for obj.message

	obj.message = {};
	// unpack for obj.message.senderUid
	const messagesenderUidSize = buf.readUInt16BE(offset);
	offset += 2;
	const messagesenderUidBytes = Bin.alloc(messagesenderUidSize);
	buf.copy(messagesenderUidBytes, 0, offset);
	offset += messagesenderUidSize;
	obj.message.senderUid = messagesenderUidBytes.toString();
	// unpack for obj.message.recipients
	const messagerecipientsSize = buf.readUInt16BE(offset);
	offset += 2;
	const messagerecipientsBytes = Bin.alloc(messagerecipientsSize);
	buf.copy(messagerecipientsBytes, 0, offset);
	offset += messagerecipientsSize;
	obj.message.recipients = messagerecipientsBytes.toString();
	// unpack for obj.message.message
	const messagemessageSize = buf.readUInt16BE(offset);
	offset += 2;
	const messagemessageBytes = Bin.alloc(messagemessageSize);
	buf.copy(messagemessageBytes, 0, offset);
	offset += messagemessageSize;
	obj.message.message = messagemessageBytes.toString();
	// Sample parameter

	obj.message.sample = {};
	// Unique ID
	obj.message.sample.id = buf.readUInt32BE(offset);
	offset += 4;
	// unpack for obj.message.sample.key
	const messagesamplekeySize = buf.readUInt16BE(offset);
	offset += 2;
	const messagesamplekeyBytes = Bin.alloc(messagesamplekeySize);
	buf.copy(messagesamplekeyBytes, 0, offset);
	offset += messagesamplekeySize;
	obj.message.sample.key = messagesamplekeyBytes.toString();
	// Probably JSON
	const messagesamplevalueSize = buf.readUInt16BE(offset);
	offset += 2;
	const messagesamplevalueBytes = Bin.alloc(messagesamplevalueSize);
	buf.copy(messagesamplevalueBytes, 0, offset);
	offset += messagesamplevalueSize;
	obj.message.sample.value = messagesamplevalueBytes.toString();
	// unpack for obj.message.sample.enabled
	obj.message.sample.enabled = buf.readUInt8(offset) === 0x01 ? true : false;
	offset += 1;
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

