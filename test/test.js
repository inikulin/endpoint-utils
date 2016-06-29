var assert        = require('assert');
var http          = require('http');
var Promise       = require('pinkie-promise');
var ip            = require('ip');
var endpointUtils = require('../');

test('isFreePort()', function () {
    return endpointUtils.isFreePort(1337)
        .then(assert)
        .then(function () {
            return new Promise(function (resolve) {
                var server = http.createServer();

                server.listen(1337);
                server.once('listening', function () {
                    var isFree = endpointUtils.isFreePort(1337);

                    server.once('close', function () {
                        resolve(isFree);
                    });

                    server.close();
                });
            });
        })
        .then(function (isFree) {
            assert(!isFree);
        });
});

test('getFreePort()', function () {
    return endpointUtils.getFreePort()
        .then(endpointUtils.isFreePort)
        .then(assert);
});

test('getFreePorts()', function () {
    return endpointUtils.getFreePorts(3)
        .then(function (ports) {
            return Promise.all(ports.map(endpointUtils.isFreePort));
        })
        .then(function (portsState) {
            assert.deepEqual(portsState, [true, true, true]);
        });
});

test('isMyHostname', function () {
    return endpointUtils.isMyHostname('127.0.0.1')
        .then(assert)
        .then(function () {
            return endpointUtils.isMyHostname('localhost')
        })
        .then(assert)
        .then(function () {
            return endpointUtils.isMyHostname(ip.address())
        })
        .then(assert)
        .then(function () {
            return endpointUtils.isMyHostname('somerandomhostname')
        })
        .then(function (isMy) {
            assert(!isMy);
        });
});

test('getMyHostname', function () {
    return endpointUtils.getMyHostname()
        .then(endpointUtils.isMyHostname)
        .then(assert);
});

test('getIPAddress', function () {
    var ip = endpointUtils.getIPAddress();

    assert(/\d+\.\d+\.\d+\.\d+/.test(ip));
});
