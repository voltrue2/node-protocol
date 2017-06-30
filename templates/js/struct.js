'use strict';

{{ getDescJs(description) }}

const name = '{{ name }}';

module.exports.name = getName;
module.exports.create = create;
module.exports.pack = pack;
module.exports.unpack = unpack;

function getName() {
	return name;
}

function create() {
	return {{ getCreateJs(params) }};
}

// converts an object into binary
function pack(obj) {
	const list = [];
	{{ getPackJs(params) }}
	return Buffer.concat(list);
}

function unpack(buf) {
	const obj = {};
	{{ getUnpackJs(params) }}
	return obj;
}

// Buffer handler static object Bin: Bin.from(<string>) and Bin.alloc(<size>)
{{ buffer }}
