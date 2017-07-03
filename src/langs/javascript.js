'use strict';

var source;

module.exports.source = source;
module.exports.getDesc = getDesc;
module.exports.getCreate = getCreate;
module.exports.getPack = getPack;
module.exports.getUnpack = getUnpack;

function source(_source) {
	source = _source;
}

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
				value = param.array ? '[]' : '\'\'';
				break;
			case 'int8':
			case 'int16':
			case 'int32':
			case 'uint8':
			case 'uint16':
			case 'uint32':
			case 'float':
			case 'double':
				value = param.array ? '[]' : '0';
				break;
			case 'bool':
				value = param.array ? '[]' : 'true';
				break;
			case 'datetime':
				value = param.array ? '[]' : 'new Date()';
				break;
			default:
				if (param.array) {
					if (!param.value) {
						throw new Error('Invalid data type as array:' + param.type);
					}
					value = '[]';
				} else {
					if (!param.value || !param.value.params) {
						throw new Error('Invalid data type:' + param.type);
					}
					value = getCreate(param.value.params, tab);
				}
				break;
		}
		code += tab + '\t' + name + ': ' + value + end;
	}
	code += tab + '}';
	return code;
}

function getPack(params, _parent, _tab, isParentArray) {
	if (!_parent) {
		_parent = '';
	}
	const tab = _tab || '\t';
	var code = '\n';
	for (var i = 0, len = params.length; i < len; i++) {
		var param = params[i];
		var name = param.name;
		var isArray = param.array || false;
		var type = param.type;
		var pname = _parent + '.' + name;
		var vname = _createVname(pname);
		/*
		code += tab + '// ' + (param.comment || 'pack ' + pname) + '\n';
		code += tab + 'if (obj' + pname + ' === null || obj' + pname + ' === undefined) {\n';
		code += tab + tab + 'throw new Error(\'obj' + pname + ' cannot be null or undefined\');\n';
		code += tab + '}\n';
		*/
		if (isArray) {
			code += tab + '// ' + pname + ' is an array\n';
			code += tab + 'const ' + vname + 'LengthBytes = Bin.alloc(2);\n';
			code += tab + vname + 'LengthBytes.writeUInt16BE(obj' + pname + '.length);\n';
			code += tab + 'list.push(' + vname  + 'LengthBytes);\n';
			code += tab + 'var ' + vname + 'Index = 0;\n';
			code += tab + 'var ' + vname + 'Len = obj' + pname + '.length;\n';
			code += tab + 'for (var ' + vname + 'Index = 0; ' + vname + 'Index < ' + vname + 'Len; ' + vname + 'Index++) {\n';
			code += _getPackValue(tab + tab, type, name, vname, pname, param, _parent);
			code += tab + '}\n';
		} else {
			param.isParentArray = isParentArray || false;
			code += _getPackValue(tab, type, name, vname, pname, param, _parent);
		}
	}
	return code;
}

function _getPackValue(tab, type, name, vname, pname, param, _parent) {
	var arrayIndex = '';
	if (param.array) {
		arrayIndex = '[' + vname + 'Index]';
		vname += 'Arr';
	}
	if (param.isParentArray) {
		const plist = pname.split('.');
		const lastItem = plist.splice(plist.length - 1, 1);
		plist.push('[' + _createVname(_parent) + 'Index]');
		plist.push(lastItem);
		pname = plist.join('.').replace('.[', '[');
	}
	var code = '';
	switch (type) {
		case 'string':
			code += tab + 'var ' + vname + 'Bytes = Bin.from(obj' + pname + arrayIndex + ');\n';
			code += tab + 'var ' + vname + 'Size = ' + vname + 'Bytes.length;\n';
			code += tab + 'var ' + vname + 'SizeBytes = Bin.alloc(2);\n';
			code += tab + vname + 'SizeBytes.writeUInt16BE(' + vname + 'Size, 0);\n';
			code += tab + 'list.push(' + vname + 'SizeBytes);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'int8':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(1);\n';
			code += tab + vname + 'Bytes.writeInt8(obj' + vpname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'int16':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(2);\n';
			code += tab + vname + 'Bytes.writeInt16BE(obj' + pname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'int32':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(4);\n';
			code += tab + vname + 'Bytes.writeInt32BE(obj' + pname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'uint8':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(1);\n';
			code += tab + vname + 'Bytes.writeUInt8(obj' + pname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'uint16':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(2);\n';
			code += tab + vname + 'Bytes.writeUInt16BE(obj' + pname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'uint32':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(4);\n';
			code += tab + vname + 'Bytes.writeUInt32BE(obj' + pname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'float':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(4);\n';
			code += tab + vname + 'Bytes.writeFloatBE(obj' + pname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'double':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(8);\n';
			code += tab + vname + 'Bytes.writeDoubleBE(obj' + pname + arrayIndex + ', 0);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'bool':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(1);\n';
			code += tab + vname + 'Bytes.writeUInt8(obj' + pname + arrayIndex + ' ? 0x01 : 0x00);\n';
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		case 'datetime':
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(8);\n';
			code += tab + vname + 'Bytes.writeDoubleBE(obj' + pname + arrayIndex + '.getTime(), 0);\n'
			code += tab + 'list.push(' + vname + 'Bytes);\n';
			break;
		default:
			if (param.array) {
				if (!param.value) {
					throw new Error('Invalid data type as array:' + param.type);
				}
				if (!source[param.type]) {
					throw new Error('Invalid data type as array:' + param.type);
				}
				code += getPack(source[param.type].params, _parent + '.' + name, tab, param.array);
			} else {
				if (!param.value || !param.value.params) {
					throw new Error('Invalid data type:' + param.type);
				}
				code += getPack(param.value.params, _parent + '.' + name);
			}
			break;
	}
	return code;
}

function getUnpack(params, _parent, _tab, isParentArray) {
	if (!_parent) {
		_parent = '';
	}
	const tab = _tab || '\t';
	var code = '\n';
	var parentArrayIndex = '';
	if (isParentArray) {
		parentArrayIndex = '[' + _createVname(_parent) + 'Index]';
	}
	if (_parent === '') {
		code += tab + 'var offset = 0;\n';
	} else {
		code += tab + 'obj' + _parent + parentArrayIndex + ' = {};\n';
	}
	for (var i = 0, len = params.length; i < len; i++) {
		var param = params[i];
		var isArray = param.array;
		var type = param.type;
		var name = param.name;
		var pname = _parent + '.' + name;
		var vname = _createVname(pname);
		code += tab + '// ' + (param.comment || 'unpack for obj' + pname) + '\n';
		if (isArray) {
			code += tab + 'obj' + pname + ' = [];\n';
			code += tab + 'var ' + vname + 'Length = buf.readUInt16BE(offset);\n';
			code += tab + 'offset += 2;\n';
			code += tab + 'var ' + vname + 'Len = ' + vname + 'Length;\n';
			code += tab + 'for (var ' + vname + 'Index = 0; ' + vname + 'Index < ' + vname + 'Length; ' + vname + 'Index++) {\n';
			code += _getUnpackValue(tab + tab, type, name, vname, pname, param, _parent);
			code += tab + '}\n';
		} else {
			var tmp = pname;
			param.isParentArray = isParentArray || false;
			if (isParentArray) {
				pname = _parent + parentArrayIndex + '.' + name;
			}
			code += _getUnpackValue(tab, type, name, vname, pname, param, _parent);
			// reset
			pname = tmp;	
		}
	}
	return code;
}

function _getUnpackValue(tab, type, name, vname, pname, param, _parent) {
	if (param.array) {
		vname += 'Arr';
	}
	const isArray = param.array;
	var code = '';
	switch (type){
		case 'string':
			code += tab + 'var ' + vname + 'Size = buf.readUInt16BE(offset);\n';
			code += tab + 'offset += 2;\n';
			code += tab + 'var ' + vname + 'Bytes = Bin.alloc(' + vname + 'Size);\n';
			code += tab + 'buf.copy(' + vname + 'Bytes, 0, offset);\n';
			code += tab + 'offset += ' + vname + 'Size;\n';
			if (isArray) {
				code += tab + 'obj' + pname + '.push(' + vname + 'Bytes.toString());\n';
			} else {
				code += tab + 'obj' + pname + ' = ' + vname + 'Bytes.toString();\n';
			}
			break;
		case 'int8':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readInt8(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readInt8(offset);\n';
			}
			code += tab + 'offset += 1;\n';
			break;
		case 'int16':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readInt16BE(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readInt16BE(offset);\n';
			}
			code += tab + 'offset += 2;\n';
			break;
		case 'int32':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readInt32BE(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readInt32BE(offset);\n';
			}
			code += tab + 'offset += 4;\n';
			break;
		case 'uint8':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readUInt8(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readUInt8(offset);\n';
			}
			code += tab + 'offset += 1;\n';
			break;
		case 'uint16':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readUInt16BE(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readUInt16BE(offset);\n';
			}
			code += tab + 'offset += 2;\n';
			break;
		case 'uint32':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readUInt32BE(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readUInt32BE(offset);\n';
			}
			code += tab + 'offset += 4;\n';
			break;
		case 'float':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readFloatBE(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readFloatBE(offset);\n';
			}
			code += tab + 'offset += 4;\n';
			break;
		case 'double':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(buf.readDoubleBE(offset));\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readDoubleBE(offset);\n';
			}
			code += tab + 'offset += 8;\n';
			break;
		case 'bool':
			if (isArray) {
				code += tab + 'obj' + pname + ' .push(buf.readUInt8(offset) === 0x01 ? true : false);\n';
			} else {
				code += tab + 'obj' + pname + ' = buf.readUInt8(offset) === 0x01 ? true : false;\n';
			}
			code += tab + 'offset += 1;\n';
			break;
		case 'datetime':
			if (isArray) {
				code += tab + 'obj' + pname + '.push(new Date(buf.readDoubleBE(offset)));\n';
			} else {
				code += tab + 'obj' + pname + ' = new Date(buf.readDoubleBE(offset));\n';
			}
			code += tab + 'offset += 8;\n';
			break;
		default:
			if (isArray) {
				if (!param.value) {
					throw new Error('Invalid data type as array:' + type);
				}
				if (!source[type]) {
					throw new Error('Invalid data type as array:' + type);
				}
				code += getUnpack(source[type].params, _parent + '.' + name, tab, isArray);
			} else {
				if (!param.value || !param.value.params) {
					throw new Error('Invalid data type:' + param.type);
				}
				code += getUnpack(param.value.params, _parent + '.' + name);
			}
			break;
	}
	return code;
}

function _createVname(pname) {
	const list = pname.split('.');
	var vname = '';
	var counter = 0;
	for (var i = 0, len = list.length; i < len; i++) {
		var name = list[i];
		if (name === '') {
			continue;
		}
		if (counter > 0) {
			var cap = name[0].toUpperCase();
			name = cap + name.substring(1);
		}
		vname += name;
		counter += 1;
	}
	return vname;
}

