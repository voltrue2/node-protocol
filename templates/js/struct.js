'use strict';
{{ description }}
const nodeBuffer = require('./node-buffer');
const types = {
{{ propTypes }}
};

module.exports = {
	create: create,
	pack: pack,
	unpack: unpack
};

function create() {
	return {{ props }};
}

function pack(obj) {

}

function unpack(buf) {

}
