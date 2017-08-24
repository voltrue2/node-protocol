'use strict';

const packer = require('../lib/js/packer');
const msg = require('msgpack-js');
const obj = { list: [
	'Hello world',
	'I have a dream!',
	'Yes we can'
] };

console.log('try:', obj);

const s1 = Date.now();
for (var i = 0; i < 100; i++) {
	var p1 = packer.pack(obj);
	var u1 = packer.unpack(p1);
}
console.log('node-protocol:', (Date.now() -s1) + 'ms:', p1.length);
const s2 = Date.now();
for (var i = 0; i < 100; i++) {
	var p2 = msg.encode(obj);
	var u2 = msg.decode(p2);
}
console.log('msgpack-js:    ', (Date.now() -s2) + 'ms:', p2.length);

