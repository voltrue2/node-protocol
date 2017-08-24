/** tests **/
const msgpack = require('msgpack-js');
const packer = require('../');
var obj = {
	deflag: false,
	eight: 0xff,
	sixteen: 0xffff,
	nil: null,
	thirtytwo: 0xffffffff,
	float: 100.12339782714844,
	double: 0xffffffffffffffff,
	name: 'what is your name?',
	_eight: -128,
	undef: undefined,
	_sixteen: -32768,
	ja: '日本語',
	_thirtytwo: -2147483648,
	map: {
		one: 1,
		two: 2,
		three: 3,
		subMap: {
			four: 4,
			five: null,
			key: 'The key is...'
		},
		list: [ 'A', 'B', null, 'C', [-1,true,false,'Hello'] ],
		food: '和食'
	},
	mixed: [
		1,
		'hello world',
		{ num: 100, num2: 1000, num3: 10000, num4: 100000, num5: undefined, foo: [1,2,3,4] },
		false,
		true,
		null,
		'こんにちは'
	],
	flag: true,
	hello: 'world',
	list: [ 1,2,3,4,5,6,7,8,9,0 ]
};
var packed = packer.pack(obj);
console.log('>>> obj:', JSON.stringify(obj, null, 2));
var unpacked = packer.unpack(packed);
console.log('>>> obj:', JSON.stringify(unpacked, null, 2));
console.log('------> JSON size', new Buffer(JSON.stringify(obj)).length);
console.log('----> packed size', packed.length);
console.log('-> correct result', JSON.stringify(obj) === JSON.stringify(unpacked));
var mp = msgpack.encode(obj);
var up = msgpack.decode(mp);
console.log('--> msgpack size', mp.length);
console.log('-> correct msg?', JSON.stringify(obj) === JSON.stringify(up));
var s = Date.now();
for (var i = 0; i < 100; i++) {
	var packed = Buffer.from(JSON.stringify(obj));
}
console.log('JSON >', Date.now() - s, packed.length);
var s2 = Date.now();
for (var i = 0; i < 100; i++) {
	var packed2 = packer.pack(obj);
}
console.log('node-protocol >', Date.now() - s2, packed2.length);
var s3 = Date.now();
for (var i = 0; i < 100; i++) {
	var packed3 = msgpack.encode(obj);
}
console.log('msgpack >', Date.now() - s3, packed3.length);

