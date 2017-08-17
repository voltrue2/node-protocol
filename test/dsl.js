'use strict';

const exec = require('child_process').exec;
const hello = require('./proto/js/hello');
const util = require('util');
const data = hello.create();
data.timelist = [
	new Date('2017-07-17 10:12:59'),
	new Date('2016-10-10 00:00:00')
];
data.uid = 'UID-abcdefg';
data.message.senderUid = 'UID-hijk';
data.message.recipients = [
	'xxx',
	'yyy',
	'zzz'
];
data.message.message = 'hello world!';
data.message.sample.id = 100;
data.message.sample.key = 'KEY-123';
data.message.sample.value = 'fooo';
data.message.sample.enabled = true;
data.message.sample.sample2list[0] = { name: 'ABC' };
data.message.sample.sample2list[1] = { name: 'DEF' };
data.message.sample.sample2list[2] = { name: 'GHI' };
data.message.sample._eight = -128;
data.message.sample._sixteen = -100;
data.message.sample._thirtytwo = -6000;
data.message.sample.datetime = new Date('2000-09-07 00:00:00');
data.message.timestamp = 0xffffffff;

console.log(JSON.stringify(data, null, 2));
console.log('===========================');
const origin = JSON.stringify(data);

var i;
var packed;
var unpacked;

const s3 = Date.now();
for (i = 0; i < 100; i++) {
	packed = new Buffer(JSON.stringify(data));
	unpacked = JSON.parse(packed);
}
console.log('JSON pack time:', Date.now() - s3);
console.log(packed.length + ' bytes');
console.log(util.inspect(unpacked, { depth: 10, colors: true }));
console.log('JSON correct?', JSON.stringify(unpacked) === origin);
console.log('--------------------------');

const msg = require('msgpack-js');
const s2 = Date.now();
for (i = 0; i < 100; i++) {
	packed = msg.encode(data);
	unpacked = msg.decode(packed);
}
console.log('msgpack pack time:', Date.now() - s2);
console.log(packed.length + ' bytes');
console.log(util.inspect(unpacked, { depth: 10, colors: true }));
console.log('msg correct?', JSON.stringify(unpacked) === origin);
console.log('--------------------------');

const s = Date.now();
for (i = 0; i < 100; i++) {
	packed = hello.pack(data);
	unpacked = hello.unpack(packed);
}
console.log('dsl pack time:', Date.now() - s);
console.log(packed.length + ' bytes');
console.log(util.inspect(unpacked, { depth: 10, colors: true }));
console.log('dsl correct?', JSON.stringify(unpacked) === origin);

/* C#
console.log('-------------------------');
exec('mono test/build/test.exe', function (err, out) {
	if (err) {
		console.error(err);
		return process.exit(1);
	}

	console.log('++++++++++++++++++++++++++');
	console.log(out);
	console.log('--------------------------');
	console.log(packed.join(' '));
	console.log('++++++++++++++++++++++++++');

	const list = out.split(' ');
	const buf = Buffer.alloc(out.length);
	for (var i = 0, len = list.length; i < len; i++) {
		buf[i] = list[i];
	}
	const unpacked = hello.unpack(buf);
	console.log(util.inspect(unpacked, { depth: 10, colors: true }));
});
*/

