'use strict';

module.exports.getDesc = getDesc;
module.exports.getCreate = getCreate;
module.exports.getPack = getPack;

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
		var comment = param.comment || 'pack ' + name;
		var pname = _parent + '.' + name;
		code += tab + '// ' + comment + '\n';
		switch (type) {
			case 'string':
				code += tab + 'const ' + name + 'Bytes = Bin.from(obj' + pname + ');\n';
				code += tab + 'const ' + name + 'Size = ' + name + 'Bytes.length;\n';
				code += tab + 'const ' + name + 'SizeBytes = Bin.alloc(2);\n';
				code += tab + name + 'SizeBytes.writeUInt16BE(' + name + 'Size, 0);\n';
				code += tab + 'list.push(' + name + 'SizeBytes);\n';
				code += tab + 'list.push(' + name + 'Bytes);\n';
				break;
			case 'int8':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(1);\n';
				code += tab + name + 'Bytes.writeInt8(obj' + pname + ');\n';
				break;
			case 'int16':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(2);\n';
				code += tab + name + 'Bytes.writeInt16BE(obj' + pname + ');\n';
				break;
			case 'int32':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(4);\n';
				code += tab + name + 'Bytes.writeInt32BE(obj' + pname + ');\n';
				break;
			case 'uint8':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(1);\n';
				code += tab + name + 'Bytes.writeUInt8(obj' + pname + ');\n';
				break;
			case 'uint16':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(2);\n';
				code += tab + name + 'Bytes.writeUInt16BE(obj' + pname + ');\n';
				break;
			case 'uint32':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(4);\n';
				code += tab + name + 'Bytes.writeUInt32BE(obj' + pname + ');\n';
				break;
			case 'float':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(4);\n';
				code += tab + name + 'Bytes.writeFloatBE(obj' + pname + ');\n';
				break;
			case 'double':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(8);\n';
				code += tab + name + 'Bytes.writeDoubleBE(obj' + pname + ');\n';
				break;
			case 'bool':
				code += tab + 'const ' + name + 'Bytes = Bin.alloc(1);\n';
				code += tab + name + 'Bytes.writeUInt8(obj' + pname +' ? 0x01 : 0x00);\n';
				break;
			default:
				if (!param.value || !param.value.params) {
					throw new Error('Invalid data type:' + param.type);
				}
				_parent += '.' + name;
				code += getPack(param.value.params, _parent);
				break;
		}
	}
	return code;
}

