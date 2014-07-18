var assert = require('assert');

describe('Frame extraction test', function() {
    var frax;
    var rcvd;
    var run;

    before(function () {
        run = function run(frameCount, frameLen) {
            var offs = 0;
            var bufs = [];

            for (var i = 0; i < frameCount; ++i) {
                var len = i;
                var buf = new Buffer(frax.frameHeaderSize() + len);
                switch (frax.frameHeaderSize()) {
                    case 1:
                        buf.writeUInt8(len, 0);
                        break;
                    case 4:
                        buf.writeUInt32BE(len, 0);
                        break;
                    default:
                        buf.writeUInt16BE(len, 0);
                }
                for (var j = 0; j < len; ++j) {
                    buf[frax.frameHeaderSize() + j] = Math.floor(Math.random()*0x100);
                }
                bufs.push(buf);
            }

            var stream = Buffer.concat(bufs);

            while (offs < stream.length) {
                var len = stream.length - offs;
                if (len > frameLen) {
                    len = frameLen;
                }
                frax.input(stream.slice(offs, offs + len));
                offs += len;
            }

            return bufs;
        };
    });

    it('Various length', function() {
        console.log('');
        [void(0), 1, 2, 4].map(function(fhLen) {
            console.log('# fhLen = ' + fhLen);
            frax = require('..').create(fhLen);
            frax.on('data', function(data) {
                rcvd.push(data);
            });
            for (var flen = 1; flen <= 100; ++flen) {
                console.log('## frame size = ' + flen);
                frax.reset();
                rcvd = [];
                var bufs = run(100, flen);
                for(var i = 0; i < bufs.length; ++i) {
                    var ibuf = bufs[i].slice(frax.frameHeaderSize());
                    assert.deepEqual(rcvd[i], ibuf);
                }
            }
        });
    });
});



