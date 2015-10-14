var os           = require('os');
var Promise      = require('pinkie-promise');
var createServer = require('net').createServer;

function checkAvailability (port, hostname) {
    return new Promise(function (resolve) {
        var server = createServer();

        server.once('error', function () {
            resolve(false);
        });

        server.once('listening', function () {
            server.once('close', function () {
                resolve(true);
            });

            server.close();
        });

        server.listen(port, hostname);
    });
}

function isFreePort (port) {
    return checkAvailability(port);
}

function getFreePort () {
    return new Promise(function (resolve) {
        var server = createServer();

        server.once('listening', function () {
            var port = server.address().port;

            server.once('close', function () {
                resolve(port);
            });

            server.close()
        });

        server.listen(0);
    });
}

function getFreePorts (count) {
    var seq     = Promise.resolve(),
        ports   = [],
        addPort = ports.push.bind(ports);

    //NOTE: Do it sequentially to avoid interference.
    for (var i = 0; i < count; i++) {
        seq = seq
            .then(getFreePort)
            .then(addPort);
    }

    return seq.then(function () {
        return ports;
    });
}

function isMyHostname (hostname) {
    return getFreePort()
        .then(function (port) {
            return checkAvailability(port, hostname);
        });
}

function getMyHostname () {
    var hostname = os.hostname();

    return isMyHostname(hostname)
        .then(function (mine) {
            if (mine)
                return hostname;

            if (os.platform() === 'mac') {
                hostname += '.local';

                return isMyHostname(hostname)
                    .then(function (mine) {
                        return mine ? hostname : '127.0.0.1';
                    });
            }

            return '127.0.0.1';
        });
}

module.exports = {
    isFreePort:    isFreePort,
    getFreePort:   getFreePort,
    getFreePorts:  getFreePorts,
    isMyHostname:  isMyHostname,
    getMyHostname: getMyHostname
};
