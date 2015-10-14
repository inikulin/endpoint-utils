var assert        = require('assert');
var http          = require('http');
var Promise       = require('pinkie-promise');
var ip            = require('ip');
var endpointUtils = require('../');

test('isFreePort()', function (done) {
    endpointUtils.isFreePort(1337)
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
            done();
        })
        .catch(done);
});

test('getFreePort()', function (done) {
    endpointUtils.getFreePort()
        .then(endpointUtils.isFreePort)
        .then(assert)
        .then(function () {
            done();
        })
        .catch(done);
});

test('getFreePorts()', function (done) {
    endpointUtils.getFreePorts(3)
        .then(function (ports) {
            return Promise.all(ports.map(endpointUtils.isFreePort));
        })
        .then(function (portsState) {
            assert.deepEqual(portsState, [true, true, true]);
        })
        .then(function () {
            done();
        })
        .catch(done);
});

test('isMyHostname', function (done) {
    endpointUtils.isMyHostname('127.0.0.1')
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
            done();
        })
        .catch(done);
});

test('getMyHostname', function (done) {
    endpointUtils.getMyHostname()
        .then(endpointUtils.isMyHostname)
        .then(assert)
        .then(function () {
            done();
        })
        .catch(done);
});
