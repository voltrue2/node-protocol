'use strict';

const hello = require('./proto/js/hello');

const data = hello.create();
data.uid = 'UID-abcdefg';
data.message.senderUid = 'UID-hijk';
data.message.recipients = 'xxx';
data.message.message = 'hello world!';
data.message.sample.id = 100;
data.message.sample.key = 'KEY-123';
data.message.sample.value = 'fooo';
data.message.sample.enable = true;
data.message.timestamp = Math.floor(Date.now() / 1000);

const packed = hello.pack(data);

console.log(packed.length);
console.log(packed);
const msg = require('msgpack-js');
const p = msg.encode(data);
console.log(p.length);
console.log(p);

