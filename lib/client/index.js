const io = require('socket.io-client');
const handlers = require('./modules/handlers');
require('bootstrap/dist/css/bootstrap.min.css');

/**
 * @type {null|string}
 */
let _cliendId = null;

/**
 * @type {null|SocketIOClient.Socket}
 */
let _socket = null;

const _connectWS = () => {
    const host = process.env.APP_HOST;
    const port = process.env.APP_PORT;
    const socket = (_socket = io.connect(`http://${host}:${port}`));

    socket.on('connect', () => {
        console.info(`[WebSocket] Socket connected!`);

        socket.on('message:welcome', ({ id: clientId }) => {
            _cliendId = clientId;
            console.info(`[WebSocket] Socket ready! (ID: ${_cliendId})`);
        });

        socket.on('action:start', () => {
            handlers.init({ mouse: true, keyboard: true }, socket);
        });
    });
};

const _bindLoginForm = () => {
    document.getElementById('login_form').addEventListener('submit', event => {
        event && event.preventDefault();

        if (_cliendId === null) {
            return;
        }

        const { value: VNCHost = null } = document.getElementById('vnc_host');
        const { value: VNCPort = void 0 } = document.getElementById('vnc_port');
        const { value: VNCPassword = void 0 } = document.getElementById(
            'vnc_password'
        );

        if (VNCHost === null) {
            return;
        }

        _socket.emit('action:vnc:connect', {
            host: VNCHost,
            port: VNCPort,
            password: VNCPassword
        });
    });
};

(() => {
    _connectWS();
    _bindLoginForm();
})();
