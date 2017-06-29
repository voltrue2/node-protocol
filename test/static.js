/** tests **/
const packer = require('../');
var obj = {
	deflag: false,
	eight: 0xff,
	sixteen: 0xffff,
	thirtytwo: 0xffffffff,
	float: 100.12339782714844,
	double: 0xffffffffffffffff,
	name: 'what is your name?',
	_eight: -128,
	_sixteen: -32768,
	ja: '日本語',
	_thirtytwo: -2147483648,
	map: {
		one: 1,
		two: 2,
		three: 3,
		subMap: {
			four: 4,
			key: 'The key is...'
		},
		list: [ 'A', 'B', 'C', [-1,true,false,'Hello'] ],
		food: '和食'
	},
	mixed: [
		1,
		'hello world',
		{ num: 100, num2: 1000, num3: 10000, num4: 100000, foo: [1,2,3,4] },
		false,
		true,
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

