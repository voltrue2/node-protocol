'use strict';

const buffer = require('./buffer');
const type = require('./type');

function Buf() {
	this.buf = buffer.alloc(0);
	this.schema = buffer.alloc(0);
	this.locked = false;
}

Buf.prototype.add = function (value) {
	if (this.locked) {
		return false;
	}
	var _type = type.get(value);
	var sizebuf;
	var buf;
	var schemabuf = buffer.alloc(1);
	schemabuf.writeUInt8(_type);
	this.schema = Buffer.concat([ this.schema, schemabuf ]);
	switch (_type) {
		case type.STR:
			sizebuf = buffer.alloc(2);
			sizebuf.writeUInt16BE(Buffer.byteLength(value));
			buf = Buffer.concat([
				sizebuf,
				buffer.alloc(value)
			]);
			break;
		case type.BUF:
		case type.BIN:
			sizebuf = buffer.alloc(2);
			sizebuf.writeUInt16BE(value.length);
			buf = Buffer.concat([
				sizebuf,
				value
			]);
			break;
		case type.INT8:
			buf = buffer.alloc(1);
			buf.writeInt8(value);
			break;
		case type.INT16:
			buf = buffer.alloc(2);
			buf.writeInt16BE(value);
			break;
		case type.INT32:
			buf = buffer.alloc(4);
			buf.writeInt32BE(value);
			break;
		case type.UINT8:
			buf = buffer.alloc(1);
			buf.writeUInt8(value);
			break;
		case type.UINT16:
			buf = buffer.alloc(2);
			buf.writeUInt16BE(value);
			break;
		case type.UINT32:
			buf = buffer.alloc(4);
			buf.writeUInt32BE(value);
			break;
		case type.DOUBLE:
			buf = buffer.alloc(8);
			buf.writeDoubleBE(value);
			break;
		case type.BOOL:
			buf = buffer.alloc(1);
			buf.writeUInt8(value ? 1 : 0);
			break;
		/*
		case type.NUL:
		case type.UNDEF:
			buf = buffer.alloc(0);
			break;
		case type.OBJ:
			value = JSON.stringify(value);
			sizebuf = buffer.alloc(2);
			sizebuf.writeUInt16BE(value.length);
			buf = Buffer.concat([
				sizebuf,
				buffer.alloc(value)
			]);
			break;
		*/
		default:
			return false;
	}
	this.buf = Buffer.concat([ this.buf, buf ]);
	return true;
};

Buf.prototype.finalize = function () {
	if (this.locked) {
		return null;
	}
	this.locked = true;
	var schemasize = buffer.alloc(1);
	schemasize.writeUInt8(this.schema.length);
	return Buffer.concat([
		type.BUF_NAME,
		schemasize,
		this.schema,
		this.buf
	]);
};

function parse(buf) {
	// skip first 4 bytes: 4-byte long name
	buf = buf.slice(4);
	// parse schema
	var schema = getSchema(buf);
	// parse payload
	var offset = schema.offset;
	var res = [];
	for (var i = 0, len = schema.types.length; i < len; i++) {
		var parsed = parseValue(schema.types[i], offset, buf);
		offset = parsed.offset;
		res.push(parsed.value);
	}
	return res;
}

function getSchema(buf) {
	var size = buf.readUInt8(0);
	var schema = {
		types: [],
		offset: size + 1
	};
	for (var i = 1, len = schema.offset; i < len; i++) {
		schema.types.push(buf.readUInt8(i));
	}
	return schema;
}

function parseValue(_type, offset, buf) {
	var res = {
		value: null,
		offset: offset
	};
	var size;
	var _buf;
	switch (_type) {
		case type.STR:
			size = buf.readUInt16BE(res.offset);
			res.offset += 2;
			_buf = buffer.alloc(size);
			buf.copy(_buf, 0, res.offset, res.offset + size);
			res.offset += size;
			res.value = _buf.toString();
			break;
		case type.BUF:
			size = buf.readUInt16BE(res.offset);
			res.offset += 2;
			var _buf = buffer.alloc(size);
			buf.copy(_buf, 0, res.offset, res.offset + size);
			res.value = parse(_buf);
			res.offset += size;
			break;
		case type.BIN:
			size = buf.readUInt16BE(res.offset);
			res.offset += 2;
			res.value = buffer.alloc(size);
			buf.copy(res.value, 0, res.offset, res.offset + size);
			res.offset += size;
			break;
		case type.BOOL:
			res.value = buf.readUInt8(res.offset) === 1 ? true : false;
			res.offset += 1;
			break;
		case type.INT8:
			res.value = buf.readInt8(res.offset);
			res.offset += 1;
			break;
		case type.INT16:
			res.value = buf.readInt16BE(res.offset);
			res.offset += 2;
			break;
		case type.INT32:
			res.value = buf.readInt32BE(res.offset);
			res.offset += 4;
			break;
		case type.UINT8:
			res.value = buf.readUInt8(res.offset);
			res.offset += 1;
			break;
		case type.UINT16:
			res.value = buf.readUInt16BE(res.offset);
			res.offset += 2;
			break;
		case type.UINT32:
			res.value = buf.readUInt32BE(res.offset);
			res.offset += 4;
			break;
		case type.DOUBLE:
			res.value = buf.readDoubleBE(res.offset);
			res.offset += 8;
			break;
		/*
		case type.OBJ:
			size = buf.readUInt16BE(res.offset);
			res.offset += 2;
			_buf = buffer.alloc(size);
			buf.copy(_buf, 0, res.offset, res.offset + size);
			res.offset += size;
			res.value = JSON.parse(_buf.toString());
			break;
		case type.NUL:
			res.value = null;
			break;
		case type.UNDEF:
			res.value = undefined;
			break;
		*/
	}
	return res;
}

module.exports.create = function () {
	return new Buf();
};

module.exports.parse = parse;

