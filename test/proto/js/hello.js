'use strict';



const name = 'hello';

module.exports.name = getName;
module.exports.create = create;
module.exports.pack = pack;
module.exports.unpack = unpack;

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
	
	// pack uid
	const uidBytes = Bin.from(obj.uid);
	const uidSize = uidBytes.length;
	const uidSizeBytes = Bin.alloc(2);
	uidSizeBytes.writeUInt16BE(uidSize, 0);
	list.push(uidSizeBytes);
	list.push(uidBytes);
	// pack message

	// pack senderUid
	const senderUidBytes = Bin.from(obj.message.senderUid);
	const senderUidSize = senderUidBytes.length;
	const senderUidSizeBytes = Bin.alloc(2);
	senderUidSizeBytes.writeUInt16BE(senderUidSize, 0);
	list.push(senderUidSizeBytes);
	list.push(senderUidBytes);
	// pack recipients
	const recipientsBytes = Bin.from(obj.message.recipients);
	const recipientsSize = recipientsBytes.length;
	const recipientsSizeBytes = Bin.alloc(2);
	recipientsSizeBytes.writeUInt16BE(recipientsSize, 0);
	list.push(recipientsSizeBytes);
	list.push(recipientsBytes);
	// pack message
	const messageBytes = Bin.from(obj.message.message);
	const messageSize = messageBytes.length;
	const messageSizeBytes = Bin.alloc(2);
	messageSizeBytes.writeUInt16BE(messageSize, 0);
	list.push(messageSizeBytes);
	list.push(messageBytes);
	// Sample parameter

	// Unique ID
	const idBytes = Bin.alloc(4);
	idBytes.writeUInt32BE(obj.message.sample.id);
	// pack key
	const keyBytes = Bin.from(obj.message.sample.key);
	const keySize = keyBytes.length;
	const keySizeBytes = Bin.alloc(2);
	keySizeBytes.writeUInt16BE(keySize, 0);
	list.push(keySizeBytes);
	list.push(keyBytes);
	// Probably JSON
	const valueBytes = Bin.from(obj.message.sample.value);
	const valueSize = valueBytes.length;
	const valueSizeBytes = Bin.alloc(2);
	valueSizeBytes.writeUInt16BE(valueSize, 0);
	list.push(valueSizeBytes);
	list.push(valueBytes);
	// pack enabled
	const enabledBytes = Bin.alloc(1);
	enabledBytes.writeUInt8(obj.message.sample.enabled ? 0x01 : 0x00);
	// pack timestamp
	const timestampBytes = Bin.alloc(4);
	timestampBytes.writeUInt32BE(obj.message.sample.timestamp);

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

