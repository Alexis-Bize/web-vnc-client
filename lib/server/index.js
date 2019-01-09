const io = require('socket.io');
const rfb2 = require('rfb2');
const express = require('express');
const { path } = require('app-root-path');
const { join, resolve: r } = require('path');

/**
 * @type {Object}
 */
const _clients = {};

/**
 * @type {null|RfbClient}
 */
let _rfbClient = null;

/**
 * @returns {string}
 */
const _createClientId = () =>
    `${Math.floor(Math.random() * 1000)}-${Math.round(Date.now() / 1000)}`;

/**
 * @type {Function}
 * @param {express.Server} server
 */
const _startWS = server => {
    io(server).on('connection', socket => {
        const clientId = _createClientId();
        const client = (_clients[clientId] = socket);

        console.info(`[WebSocket] Client joined! (ID: ${clientId})`);

        client.emit('message:welcome', {
            id: clientId
        });

        client.on('dispatch:mouse:move', message => {
            console.log(message);
        });

        client.on('action:vnc:connect', message => {
            console.info(message);

            if (_rfbClient !== null) {
                // return;
            }

            const rfbClient = (_rfbClient = rfb2.createConnection({
                host: message.host,
                port: message.port || 5900,
                password: message.password || void 0
            }));

            rfbClient.on('connect', () => {
                console.info('Ayyy yiiis');
            });

            rfbClient.on('error', err => {
                _rfbClient = null;
                console.error(err.message);
            });
        });
    });
};

const app = express();
const host = process.env.APP_HOST;
const port = process.env.APP_PORT;

app.use('/assets', express.static(r(path, 'dist/assets')));
app.get('/', (_, res) => {
    res.sendFile(join(path, 'dist/index.html'));
});

console.info(`[VNC CLIENT] Starting...`);

const server = app.listen(port, host, (err = null) => {
    if (err !== null) throw err;
    else _startWS(server);
    console.info(`[VNC CLIENT] Started with success!`);
    console.info(` * Listening at http://${host}:${port}`);
});
