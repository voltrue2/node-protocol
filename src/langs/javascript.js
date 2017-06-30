'use strict';

module.exports.getDesc = getDesc;
module.exports.getCreate = getCreate;
module.exports.getPack = getPack;
module.exports.getUnpack = getUnpack;

function getDesc(description) {
	return description ? '/* ' + description + ' */' : '';
}

function getCreate(params, tab) {
	if (!tab) {
		tab = '';
	}
	tab += '\t';
	var code = '{\n';
	for (var i = 0, len = params.length; i < len; i++) {
		var param = params[i];
		var name = param.name;
		var end = i < len - 1 ? ',\n': '\n';
		var value;
		switch (param.type) {
			case 'string':
				value = '\'\'';
				break;
			case 'int8':
			case 'int16':
			case 'int32':
			case 'uint8':
			case 'uint16':
			case 'uint32':
			case 'float':
			case 'double':
				value = '0';
				break;
			case 'bool':
				value = 'true';
				break;
			default:
				if (!param.value || !param.value.params) {
					throw new Error('Invalid data type:' + param.type);
				}
				value = getCreate(param.value.params, tab);
				break;
		}
		code += tab + '\t' + name + ': ' + value + end;
	}
	code += tab + '}';
	return code;
}

function getPack(params, _parent) {
	if (!_parent) {
		_parent = '';
	}
	const tab = '\t';
	var code = '\n';
	for (var i = 0, len = params.length; i < len; i++) {
		var param = params[i];
		var name = param.name;
		var type = param.type;
		var pname = _parent + '.' + name;
		var vname = pname.replace(/\./g, '');
		code += tab + '// ' + (param.comment || 'pack ' + pname) + '\n';
		code += tab + 'if (obj' + pname + ' === null || obj' + pname + ' === undefined) {\n';
		code += tab + tab + 'throw new Error(\'obj' + pname + ' cannot be null or undefined\');\n';
		code += tab + '}\n';
		switch (type) {
			case 'string':
				code += tab + 'const ' + vname + 'Bytes = Bin.from(obj' + pname + ');\n';
				code += tab + 'const ' + vname + 'Size = ' + vname + 'Bytes.length;\n';
				code += tab + 'const ' + vname + 'SizeBytes = Bin.alloc(2);\n';
				code += tab + vname + 'SizeBytes.writeUInt16BE(' + vname + 'Size, 0);\n';
				code += tab + 'list.push(' + vname + 'SizeBytes);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'int8':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(1);\n';
				code += tab + vname + 'Bytes.writeInt8(obj' + vpname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'int16':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(2);\n';
				code += tab + vname + 'Bytes.writeInt16BE(obj' + pname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'int32':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(4);\n';
				code += tab + vname + 'Bytes.writeInt32BE(obj' + pname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'uint8':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(1);\n';
				code += tab + vname + 'Bytes.writeUInt8(obj' + pname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'uint16':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(2);\n';
				code += tab + vname + 'Bytes.writeUInt16BE(obj' + pname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'uint32':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(4);\n';
				code += tab + vname + 'Bytes.writeUInt32BE(obj' + pname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'float':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(4);\n';
				code += tab + vname + 'Bytes.writeFloatBE(obj' + pname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'double':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(8);\n';
				code += tab + vname + 'Bytes.writeDoubleBE(obj' + pname + ', 0);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			case 'bool':
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(1);\n';
				code += tab + vname + 'Bytes.writeUInt8(obj' + pname +' ? 0x01 : 0x00);\n';
				code += tab + 'list.push(' + vname + 'Bytes);\n';
				break;
			default:
				if (!param.value || !param.value.params) {
					throw new Error('Invalid data type:' + param.type);
				}
				code += getPack(param.value.params, _parent + '.' + name);
				break;
		}
	}
	return code;
}

function getUnpack(params, _parent) {
	if (!_parent) {
		_parent = '';
	}
	const tab = '\t';
	var code = '\n';
	if (_parent === '') {
		code += tab + 'var offset = 0;\n';
	} else {
		code += tab + 'obj' + _parent + ' = {};\n';
	}
	for (var i = 0, len = params.length; i < len; i++) {
		var param = params[i];
		var type = param.type;
		var name = param.name;
		var pname = _parent + '.' + name;
		var vname = pname.replace(/\./g, '');
		code += tab + '// ' + (param.comment || 'unpack for obj' + pname) + '\n';
		switch (type){
			case 'string':
				code += tab + 'const ' + vname + 'Size = buf.readUInt16BE(offset);\n';
				code += tab + 'offset += 2;\n';
				code += tab + 'const ' + vname + 'Bytes = Bin.alloc(' + vname + 'Size);\n';
				code += tab + 'buf.copy(' + vname + 'Bytes, 0, offset);\n';
				code += tab + 'offset += ' + vname + 'Size;\n';
				code += tab + 'obj' + pname + ' = ' + vname + 'Bytes.toString();\n';
				break;
			case 'int8':
				code += tab + 'obj' + pname + ' = buf.readInt8(offset);\n';
				code += tab + 'offset += 1;\n';
				break;
			case 'int16':
				code += tab + 'obj' + pname + ' = buf.readInt16BE(offset);\n';
				code += tab + 'offset += 2;\n';
				break;
			case 'int32':
				code += tab + 'obj' + pname + ' = buf.readInt32BE(offset);\n';
				code += tab + 'offset += 4;\n';
				break;
			case 'uint8':
				code += tab + 'obj' + pname + ' = buf.readUInt8(offset);\n';
				code += tab + 'offset += 1;\n';
				break;
			case 'uint16':
				code += tab + 'obj' + pname + ' = buf.readUInt16BE(offset);\n';
				code += tab + 'offset += 2;\n';
				break;
			case 'uint32':
				code += tab + 'obj' + pname + ' = buf.readUInt32BE(offset);\n';
				code += tab + 'offset += 4;\n';
				break;
			case 'float':
				code += tab + 'obj' + pname + ' = buf.readFloatBE(offset);\n';
				code += tab + 'offset += 4;\n';
				break;
			case 'double':
				code += tab + 'obj' + pname + ' = buf.readDoubleBE(offset);\n';
				code += tab + 'offset += 8;\n';
				break;
			case 'bool':
				code += tab + 'obj' + pname + ' = buf.readUInt8(offset) === 0x01 ? true : false;\n';
				code += tab + 'offset += 1;\n';
				break;
			default:
				if (!param.value || !param.value.params) {
					throw new Error('Invalid data type:' + param.type);
				}
				code += getUnpack(param.value.params, _parent + '.' + name);
				break;
		}
	}
	return code;
}

