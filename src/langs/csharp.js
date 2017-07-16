'use strict';

const lib = require('../lib');

var source;

module.exports.source = source;
module.exports.getProps = getProps;
module.exports.getPack = getPack;
module.exports.getUnpack = getUnpack;
module.exports.getByteProps = getByteProps;

function source(_source) {
	source = _source;
}

function getProps(params) {
	var code = '';
	for (var i = 0, len = params.length; i < len; i++) {
		var tab = i === 0 ? '' : '\t\t';
		var param = params[i];
		var name = param.name;
		var value;
		switch (param.type) {
			case 'string':
				code += _propName(tab, 'string', param.array, name);
				break;
			case 'int8':
				code += _propName(tab, 'sbyte', param.array, name);
				break;
			case 'int16':
				code += _propName(tab, 'short', param.array, name);
				break;
			case 'int32':
				code += _propName(tab, 'int', param.array, name);
				break;
			case 'uint8':
				code += _propName(tab, 'byte', param.array, name);
				break;
			case 'uint16':
				code += _propName(tab, 'ushort', param.array, name);
				break;
			case 'uint32':
				code += _propName(tab, 'uint', param.array, name);
				break;
			case 'float':
				code += _propName(tab, 'float', param.array, name);
				break;
			case 'double':
				code += _propName(tab, 'double', param.array, name);
				break;
			case 'bool':
				code += _propName(tab, 'bool', param.array, name);
				break;
			case 'datetime':
				code += _propName(tab, 'System.DateTime', param.array, name);
				break;
			default:
				if (param.array) {
					if (!param.value) {
						throw new Error('Invalid data type as array:' + param.type);
					}
					code += _propName(tab, 'NodeProtocol.' + lib.className(param.type), param.array, name);
				} else {
					if (!param.value || !param.value.params) {
						throw new Error('Invalid data type:' + param.type);
					}
					code += _propName(tab, 'NodeProtocol.' + lib.className(param.type), param.array, name);
				}
				break;
		}
	}
	return code;
}

function getPack(params, _parent, _tab, isParentArray) {
	if (!_parent) {
		_parent = '';
	}
	const tab = _tab || '\t\t\t';
	const SIZE = 0;
	var i;
	var len;
	var param;
	var name;
	var type;
	var code = '\n';
	code += tab + 'int totalBufSize = 0;\n';
	for (i = 0, len = params.length; i < len; i++) {
		param = params[i];
		name = param.name;
		type = param.type;
		if (param.array) {
			code += tab + '// ' + lib.className(name) + ' is an array of ' + _dataType(type) + '\n';
			code += tab + 'totalBufSize += 2;\n';
			code += tab + 'List<byte[]> ' + name + 'PackByteList = new List<byte[]>();\n';
			code += tab + 'for (int ' + name + 'Index = 0, ' + name +
				'ArrayLength = ' + lib.className(name) + '.Length; ' +
				name + 'Index < ' + name + 'ArrayLength; ' + name + 'Index++) {\n';
			code += _getPackBytes(tab + '\t', type, name, param);
			code += tab + '\t' + name + 'PackByteList.Add(' + name + 'Bytes);\n';
			code += tab + '}\n';
		} else {
			code += _getPackBytes(tab, type, name, param);
		}
	}
	code += '\n';
	code += tab + '// create pack buffer\n';
	code += tab + 'byte[] buf = new byte[totalBufSize];\n';
	code += tab + 'int offset = 0;\n';
	code += '\n';
	for (i = 0, len = params.length; i < len; i++) {
		param = params[i];
		name = param.name;
		type = param.type;
		if (param.array) {
			code += tab + '// ' + lib.className(name) + ' is an array of ' + _dataType(type) + '\n';
			code += tab + '_2bytes = BitConverter.GetBytes((ushort)' + lib.className(name) + '.Length);\n';
			code += tab + 'Array.Reverse(_2bytes);\n';
			code += tab + 'Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);\n';
			code += tab + 'offset += 2;\n';
			code += tab + 'for (int ' + name + 'Index = 0, ' + name +
				'ArrayLength = ' + lib.className(name) + '.Length; ' +
				name + 'Index < ' + name + 'ArrayLength; ' + name + 'Index++) {\n';
			code += _getPackValue(tab + '\t', type, name, param);
			code += tab + '}\n';
		} else {
			code += _getPackValue(tab, type, name, param);
		}
	}
	return code;
}

function _getPackBytes(tab, type, name, param) {
	const capName = lib.className(name);
	const comment = (param.comment ? param.comment + ': ' : '') + 'get byte size of ' + _dataType(type) + ' as ' + lib.className(name);
	const suffix = '[' + name + 'Index]';
	const bname = name + 'Bytes';
	const sname = param.array ? capName + suffix : capName;
	var extra = '';
	var code = tab + '// ' + comment + '\n';
	switch (type) {
		case 'string':
			code += tab + 'byte[] ' + bname + ' = Encoding.UTF8.GetBytes(' + sname + ');\n'
			code += tab + 'totalBufSize += 2 + ' + bname + '.Length;\n';
			break;
		case 'int8':
		case 'uint8':
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes(' + sname + ');\n';
			code += tab + 'totalBufSize += 1;\n';
			break;
		case 'int16':
			// little endian
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes(' + sname + ');\n';
			code += tab + 'totalBufSize += 2;\n';
			break;
		case 'int32':
			// little endian
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes(' + sname + ');\n';
			code += tab + 'totalBufSize += 4;\n';
			break;
		case 'uint16':
			// big endian
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes(' + sname + ');\n';
			code += tab + 'Array.Reverse(' + bname + ');\n';
			code += tab + 'totalBufSize += 2;\n';
			break;
		case 'uint32':
		case 'float':
			// big endian
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes(' + sname + ');\n';
			code += tab + 'Array.Reverse(' + bname + ');\n';
			code += tab + 'totalBufSize += 4;\n';
			break;
		case 'double':
			// big endian
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes(' + sname + ');\n';
			code += tab + 'Array.Reverse(' + bname + ');\n';
			code += tab + 'totalBufSize += 8;\n';
			break;
		case 'bool':
			code += tab + 'int ' + name + 'Bool = 0;\n';
			code += tab + 'if (' + sname + ' == true) {\n';
			code += tab + '\t' + name + 'Bool = 1;\n';
			code += tab + '}\n';
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes(' + name + 'Bool);\n';
			code += tab + 'totalBufSize += 1;\n';
			break;
		case 'datetime':
			code += tab + 'double ' + name + 'Time = (' + sname + ' - new DateTime(1970, 1, 1)).TotalMilliseconds;\n';
			code += tab + 'byte[] ' + bname + ' = BitConverter.GetBytes((double)' + name + 'Time);\n';
			code += tab + 'Array.Reverse(' + bname + ');\n';
			code += tab + 'totalBufSize += 8;\n';
			break;
		default:
			if (!param.value) {
				throw new Error('Invalid data type:' + param.type);
			}
			code += tab + 'byte[] ' + bname + ' = ' + sname + '.Pack();\n';
			code += tab + 'totalBufSize += 2 + ' + bname + '.Length;\n';
			break;
	}
	return code;
}

function _getPackValue(tab, type, name, param) {
	const capName = lib.className(name);
	const comment = (param.comment ? param.comment + ': ' : '') + 'pack ' + _dataType(type) + ' as ' + lib.className(name);
	const suffix = '[' + name + 'Index]';
	const bname = name + 'Bytes';
	const sname = param.array ? capName + suffix : capName;
	var extra = '';
	var code = tab + '// ' + comment + '\n';
	// copy the param byte data
	if (param.array) {
		const lname = name + 'PackByteList[' + name + 'Index]';
		switch (type) {
			case 'int8':
			case 'uint8':
			case 'int16':
			case 'uint16':
			case 'int32':
			case 'uint32':
			case 'float':
			case 'double':
			case 'bool':
			case 'datetime':
				break;
			case 'string':
			default:
				code += tab + '_2bytes = BitConverter.GetBytes((ushort)' + lname + '.Length);\n';
				code += tab + 'Array.Reverse(_2bytes);\n';
				code += tab + 'Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);\n';
				code += tab + 'offset += 2;\n';
				break;	
		}
		code += tab + 'Buffer.BlockCopy(buf, offset, ' + lname + ', 0, ' + lname + '.Length);\n';
		// update the offset by adding the param byte data size
		code += tab + 'offset += ' + lname + '.Length;\n';
	} else {
		switch (type) {
			case 'int8':
			case 'uint8':
			case 'int16':
			case 'uint16':
			case 'int32':
			case 'uint32':
			case 'float':
			case 'double':
			case 'bool':
			case 'datetime':
				break;
			case 'string':
			default:
				code += tab + '_2bytes = BitConverter.GetBytes((ushort)' + bname + '.Length);\n';
				code += tab + 'Array.Reverse(_2bytes);\n';
				code += tab + 'Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);\n';
				code += tab + 'offset += 2;\n';
				break;	
		}
		code += tab + 'Buffer.BlockCopy(buf, offset, ' + bname + ', 0, ' + bname + '.Length);\n';
		// update the offset by adding the param byte data size
		switch (type) {
			case 'int8':
			case 'uint8':
				code += tab + 'offset += 1;\n';
				break;
			case 'int16':
			case 'uint16':
				code += tab + 'offset += 2;\n';
				break;
			case 'int32':
			case 'uint32':
			case 'float':
				code += tab + 'offset += 4;\n';
				break;
			case 'double':
				code += tab + 'offset += 8;\n';
				break;
			case 'bool':
				code += tab + 'offset += 1;\n';
				break;
			case 'datetime':
				code += tab + 'offset += 8;\n';
				break;
			case 'string':
			default:
				code += tab + 'offset += ' + bname + '.Length;\n';
				break;	
		}
	}
	return code;
}

function getUnpack(params, _parent, _tab, isParentArray) {
	if (!_parent) {
		_parent = '';
	}
	const tab = _tab || '\t\t\t\t';
	var code = '\n';
	var parentArrayIndex = '';
	if (isParentArray) {
		parentArrayIndex = '[' + _createVname(_parent) + 'Index]';
	}
	for (var i = 0, len = params.length; i < len; i++) {
		var param = params[i];
		var isArray = param.array;
		var type = param.type;
		var name = param.name;
		var capName = lib.className(name);
		if (isArray) {
			code += tab + '// unpack ' + name + ' as array of ' + type + '\n';
			code += tab + 'Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);\n';
			code += tab + 'Array.Reverse(_2bytes);\n';
			code += tab + 'offset += 2;\n';
			code += tab + 'int ' + name + 'Length = (int)BitConverter.ToUInt16(_2bytes, 0);\n';
			code += tab + capName + ' = new ' + _dataType(type) + '[' + name + 'Length];\n';
			code += tab + 'int ' + name + 'Index = 0;\n';
			code += tab + 'for (' + name + 'Index = 0; ' + name + 'Index < ' + name + 'Length; '+ name + 'Index++) {\n';
			code += _getUnpackValue(tab + '\t', type, name, param); 
			code += tab + '}\n';
		} else {
			code += _getUnpackValue(tab, type, name, param);
		}
	}
	return code;
}

function _getUnpackValue(tab, type, name, param) {
	const isArray = param.array;
	const comment = (param.comment ? param.comment + ': ' : '') +  'unpack ' + _dataType(type) + ' as ' + lib.className(name);
	var capName = lib.className(name);
	var code = tab + '// ' + comment + '\n';
	switch (type){
		case 'string':
			code += tab + 'Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);\n';
			code += tab + 'Array.Reverse(_2bytes);\n';
			code += tab + 'offset += 2;\n';
			code += tab + 'int ' + name + 'Size = (int)BitConverter.ToUInt16(_2bytes, 0);\n';
			code += tab + 'byte[] ' + name + 'Bytes = new byte[' + name + 'Size];\n';
			code += tab + 'Buffer.BlockCopy(buf, offset, ' + name + 'Bytes, 0, ' + name + 'Size);\n';
			code += tab + 'offset += ' + name + 'Size;\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = Encoding.UTF8.GetString(' + name + 'Bytes);\n'; 
			} else {
				code += tab + capName + ' = Encoding.UTF8.GetString(' + name + 'Bytes);\n';
			}
			break;
		case 'int8':
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (sbyte)buf[offset];\n';
			} else {
				code += tab + capName + ' = (sbyte)buf[offset];\n';
			}
			code += tab + 'offset++;\n';
			break;
		case 'int16':
			//little endian
			code += tab + 'Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (int)BitConverter.ToInt16(_2bytes, 0);\n';
			} else {
				code += tab + capName + ' = (short)BitConverter.ToInt16(_2bytes, 0);\n';
			}
			code += tab + 'offset += 2;\n';
			break;
		case 'int32':
			//little endian
			code += tab + 'Buffer.BlockCopy(buf, offset, _4bytes, 0, 4);\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (int)BitConverter.ToInt32(_4bytes, 0);\n';
			} else {
				code += tab + capName + ' = (int)BitConverter.ToInt32(_4bytes, 0);\n';
			}
			code += tab + 'offset += 4;\n';
			break;
		case 'uint8':
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (byte)buf[offset];\n';
			} else {
				code += tab + capName + ' = (byte)buf[offset];\n';
			}
			code += tab + 'offset++;\n';
			break;
		case 'uint16':
			code += tab + 'Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);\n';
			code += tab + 'Array.Reverse(_2bytes);\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (int)BitConverter.ToUInt16(_2bytes, 0);\n';
			} else {
				code += tab + capName + ' = (ushort)BitConverter.ToUInt16(_2bytes, 0);\n';
			}
			code += tab + 'offset += 2;\n';
			break;
		case 'uint32':
			code += tab + 'Buffer.BlockCopy(buf, offset, _4bytes, 0, 4);\n';
			code += tab + 'Array.Reverse(_4bytes);\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (int)BitConverter.ToUInt32(_4bytes, 0);\n';
			} else {
				code += tab + capName + ' = (uint)BitConverter.ToUInt32(_4bytes, 0);\n';
			}
			code += tab + 'offset += 4;\n';
			break;
		case 'float':
			code += tab + 'Buffer.BlockCopy(buf, offset, _4bytes, 0, 4);\n';
			code += tab + 'Array.Reverse(_4bytes);\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (int)BitConverter.ToSingle(_4bytes, 0);\n';
			} else {
				code += tab + capName + ' = (int)BitConverter.ToSingle(_4bytes, 0);\n';
			}
			code += tab + 'offset += 4;\n';
			break;
		case 'double':
			code += tab + 'Buffer.BlockCopy(buf, offset, _8bytes, 0, 8);\n';
			code += tab + 'Array.Reverse(_8bytes);\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = (int)BitConverter.ToDouble(_8bytes, 0);\n';
			} else {
				code += tab + capName + ' = (int)BitConverter.ToDouble(_8bytes, 0);\n';
			}
			code += tab + 'offset += 8;\n';
			break;
		case 'bool':
			code += tab + 'bool ' + name + 'Bool = false;\n';
			code += tab + 'byte ' + name + 'Value = (byte)buf[offset];\n';
			code += tab  + 'if (' + name + 'Value == 1) {\n';
			code += tab + '\t' + name + 'Bool = true;\n';
			code += tab + '}\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = ' + name + 'Bool;\n';
			} else {
				code += tab + capName + ' = ' + name + 'Bool;\n';
			}
			code += tab + 'offset += 1;\n';
			break;
		case 'datetime':
			code += tab + 'Buffer.BlockCopy(buf, offset, _8bytes, 0, 8);\n';
			code += tab + 'Array.Reverse(_8bytes);\n';
			code += tab + 'TimeSpan ' + name + 'Time = TimeSpan.FromMilliseconds(BitConverter.ToDouble(_8bytes, 0));\n';
			if (isArray) {
				code += tab + capName + '[' + name + 'Index] = new DateTime(1970, 1, 1) +  ' + name + 'Time;\n';
			} else {
				code += tab + capName + ' = new DateTime(1970, 1, 1) +  ' + name + 'Time;\n';
			}
			code += tab + 'offset += 8;\n';
			break;
		default:
			code += tab + 'Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);\n';
			code += tab + 'Array.Reverse(_2bytes);\n';
			code += tab + 'int ' + name + 'Size = (int)BitConverter.ToUInt16(_2bytes, 0);\n';
			code += tab + 'offset += 2;\n';
			code += tab + 'byte[] ' + name + 'Bytes = new byte[' + name + 'Size];\n';
			code += tab + 'Buffer.BlockCopy(buf, offset, ' + name + 'Bytes, 0, ' + name + 'Size);\n';
			if (isArray) {
				if (!param.value) {
					throw new Error('Invalid data type as array:' + type);
				}
				if (!source[type]) {
					throw new Error('Invalid data type as array:' + type);
				}
				code += tab + capName + '[' + name + 'Index] = new ' + lib.className(type) + '(' + name + 'Bytes);\n';
			} else {
				if (!param.value || !param.value.params) {
					throw new Error('Invalid data type:' + param.type);
				}
				code += tab + capName + ' = new ' + lib.className(type) + '(' + name + 'Bytes);\n';
			}
			code += tab + 'offset += ' + name + 'Size;\n';
			break;
	}
	return code;
}

function getByteProps(params) {
	const seen = [];
	var code = '';
	var counter = 0;
	for (var i = 0, len = params.length; i < len; i++) {
		var param = params[i];
		var type = param.type;
		var isArray = param.array;
		if (seen.indexOf(2) === -1 && (type === 'string' || type === 'int16' || type === 'uint16' || isArray)) {
			var tab = counter > 0 ? '\t\t' : '';
			seen.push(2);
			code += tab + 'private byte[] _2bytes = new byte[2];\n';
			counter += 1;
		}
		if (seen.indexOf(4) === -1 && (type === 'int32' || type === 'uint32' || type === 'float')) {
			var tab = counter > 0 ? '\t\t' : '';
			seen.push(4);
			code += tab + 'private byte[] _4bytes = new byte[4];\n';
			counter += 1;
		}
		if (seen.indexOf(8) === -1 && (type === 'double' || type === 'datetime')) {
			var tab = counter > 0 ? '\t\t' : '';
			seen.push(8);
			code += tab + 'private byte[] _8bytes = new byte[8];\n';
			counter += 1;
		}
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

function _propName(tab, type, isArray, name) {
	const _name = lib.className(name);
	const _type = type + (isArray ? '[]' : '');
	return tab + 'public ' + _type + ' ' + _name + ' { get; set; }\n';
}

function _dataType(type) {
	switch (type) {
		case 'datetime':
			return 'System.DateTime';
		case 'int8':
			return 'sbyte';
		case 'int16':
			return 'short';
		case 'int32':
			return 'int';
		case 'uint8':
			return 'byte';
		case 'uint16':
			return 'ushort';
		case 'uin32':
			return 'uint';
		case 'float':
		case 'double':
		case 'bool':
		case 'string':
			return type;
		default:
			return lib.className(type);
	}
}

