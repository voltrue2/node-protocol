'use strict';

module.exports.desc = desc;
module.exports.className = className;
module.exports.dot2camel = dot2camel;

function desc(description) {
	return description ? '\n/* ' + description + ' */\n' : '';
}

function className(name) {
	const cap = name[0].toUpperCase();
	return cap + name.substring(1);
}

function dot2camel(name) {
	const list = name.split('.');
	var camel = '';
	var counter = 0;
	for (var i = 0, len = list.length; i < len; i++) {
		var item = list[i];
		if (!item) {
			continue;
		}
		if (counter > 0) {
			item = className(item);
		}
		camel += item;
		counter += 1;
	}
	return camel;
}
