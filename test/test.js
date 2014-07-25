var assert = require('assert');

describe('Frame extraction test', function () {
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

    it('Header size test', function () {
        var specs = [
            { len: void(0), exp: 2 },
            { len: 1, exp: 1 },
            { len: 2, exp: 2 },
            { len: 4, exp: 4 },
            { len: 8, exp: 2 }
        ];

        specs.forEach(function (spec) {
            var frax = require('..').create(spec.len);
            assert.strictEqual(frax.frameHeaderSize(), spec.exp);
            assert.strictEqual(frax.headerSize, spec.exp);
        });
    });

    it('Various length', function () {
        [void(0), 1, 2, 4].forEach(function (fhLen) {
            frax = require('..').create(fhLen);
            frax.on('data', function (data) {
                rcvd.push(data);
            });
            for (var flen = 1; flen <= 100; ++flen) {
                frax.reset();
                rcvd = [];
                var bufs = run(100, flen);
                for(var i = 0; i < bufs.length; ++i) {
                    var ibuf = bufs[i].slice(frax.headerSize);
                    assert.deepEqual(rcvd[i], ibuf);
                }
            }
        });
    });
});



