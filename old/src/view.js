'use strict';

const fs = require('fs');
const buffer = fs.readFileSync(__dirname + '/buffer.js', 'utf8');
const sourceDataMap = {
	struct: {}
};
const source = {};

module.exports.setup = setup;
module.exports.getAllData = getAllData;
module.exports.getDataByName = getDataByName;
module.exports.getBufferCode = getBufferCode;

function getAllData() {
	return source;
}

function getDataByName() {
	return source[name] || null;
}

function getBufferCode() {
	return buffer;
}

function setup(list) {
	createSourceDataMap(list);
	for (const dsl in sourceDataMap) {
		var map = sourceDataMap[dsl];
		for (const name in map) {
			var item = map[name];
			if (source[name]) {
				throw new Error('Duplicate data name:' + name);
			}
			switch (item.dsl) {
				case 'struct':
					source[name] = getStruct(item);
					break;
			}
		}
	}
}

function createSourceDataMap(list) {
	for (var i = 0, len = list.length; i < len; i++) {
		for (const name in list[i]) {
			var item = list[i][name];
			sourceDataMap.struct[name] = { name: name };
			for (const key in item) {
				sourceDataMap.struct[name][key] = item[key];
			}
		}
	}
}

function getStruct(data) {
	const obj = {};
	obj.name = data.name;
	obj.description = data.description || null;
	for (const i in data) {
		if (i === 'name' || i === 'description' && i === 'params') {
			continue;
		}
		obj[i] = data[i];
	}
	obj.params = [];
	for (const key in data.params) {
		var param = data.params[key];
		obj.params.push({
			type: param.type,
			name: key,	
			value: getTypeValue(param.type, param.array),
			array: param.array || false,
			comment: param.comment || null
		});
	}
	return obj;
}

function getTypeValue(type, isArray) {
	if (isArray) {
		return [];
	}
	switch (type) {
		case 'string':
			return isArray ? [] : '';
		case 'int8':
		case 'int16':
		case 'int32':
		case 'uint8':
		case 'uint16':
		case 'uint32':
			return isArray ? [] : 0;
		case 'float':
		case 'double':
			return isArray ? [] : 0.0;
		case 'bool':
			return isArray ? [] : true;
		case 'datetime':
			return isArray ? [] : new Date(); 
		default:
			// only struct can be sub struct
			if (sourceDataMap.struct[type]) {
				if (isArray) {
					return [ getStruct(sourceDataMap.struct[type]) ];
				}
				return getStruct(sourceDataMap.struct[type]);
			}	
		throw new Error('Invalid data type:' + type);
	}
}
