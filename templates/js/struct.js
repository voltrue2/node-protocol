'use strict';

{{ getDescJs(description) }}

const id = {{ index }};
const name = '{{ name }}';

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
