/**
 * @type {Objec}
 */
const _keyboardHandlers = {};

/**
 * @type {Objec}
 */
const _mouseHandlers = {};

/**
 * @param {Function} emit
 */
const _initKeyboardHandler = emit => {};

/**
 * @param {SocketIOClient.Socket} socket
 */
const _initMouseHandler = socket => {
    _mouseHandlers.mouseMove = event => {
        socket.emit('dispatch:mouse:move', {
            clientX: event.clientX,
            clientY: event.clientY,
            buttons: event.buttons
        });
    };

    document.addEventListener('mousemove', _mouseHandlers.mouseMove);
};

/**
 * @param {Object} options
 * @param {SocketIOClient.Socket} socket
 */
export const init = (options, socket) => {
    const { keyboard = true, mouse = true } = options;
    keyboard && _initKeyboardHandler(socket.emit);
    mouse && _initMouseHandler(socket.emit);
};
