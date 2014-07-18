# frax

Frame extractor from data stream (e.g. TCP).

## Installation
    $ npm install frax

## Features
* Extract frames delimited by frame header (frame length)
* Supports various frame length (1, 2, 4 bytes)
* Frame length 2 is equivalent to RFC 4571.

## API

### Class method
* create([headerLen])
Creates an instance of frax. The headerLen would should either be 1, 2 or 4. Default is 2.

### Instance method
* frax.input(buf) -
Input stream data. The buf is of type Buffer.
* frax.frameHeaderSize() -
Returns frame header size use by the instance.
* frax.reset() -
Reset the internal state. Probably useless expect for test purposes.
* Event: 'data' -
Emitted when a complete frame is ready. The argument `buf` will be a Buffer.

## Example

```js
var frax = require('frax').create();

// Set up data event handler
frax.on('data', function (frame) {
    console.log('%d bytes of frame received', frame.length);
});

// Pass incoming data into framx directly.
soc.on('data', function (buf) {
    frax.input(buf);
});

```
