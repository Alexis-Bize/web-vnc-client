import * as io from 'socket.io';
import { v4 } from 'uuid';
import { Server } from 'http';
import { createRfbClient } from './modules/rfb';
import { ClientId, IClients } from '../typings/sockets';
import { RfbClient } from 'rfb2';

import {
    IRfbCredentials,
    IMouseMove,
    IKeyboardPress
} from '../../common/typings/events';

import {
    EVENTS_MESSAGES,
    EVENTS_ACTIONS,
    EVENTS_DISPATCH
} from '../../common/events';

const _clients: IClients = {};
const _createUniqueClientId = (): ClientId => v4();
const _addListeners = (client: io.Socket, rfbClient: RfbClient) => {
    client.on(EVENTS_DISPATCH.CLIENT_READY, () => {
        client.on(EVENTS_DISPATCH.MOUSE_MOVE, (message: IMouseMove) => {
            const { clientX, clientY, buttons } = message;
            const { pointerEvent } = rfbClient as any;
            pointerEvent({ clientX, clientY, buttons });
        });

        client.on(EVENTS_DISPATCH.KEYBOARD_PRESS, (message: IKeyboardPress) => {
            console.log(message);
        });

        rfbClient.on('rect', rect => {
            const { x, y, width, height } = rect;
            const message = { x, y, width, height, rect };
            client.send(EVENTS_DISPATCH.VNC_FRAME, {
                ...message
            });
        });
    });
};

export default (server: Server) => {
    io(server).on('connection', socket => {
        const clientId: ClientId = _createUniqueClientId();
        const client: io.Socket = (_clients[clientId] = socket);

        client.emit(EVENTS_MESSAGES.WELCOME, {
            id: clientId
        });

        client.on(EVENTS_ACTIONS.VNC_CONNECT, (message: IRfbCredentials) => {
            createRfbClient(message, (err: any, rfbClient: RfbClient) => {
                if (err !== null) {
                    client.emit(EVENTS_MESSAGES.VNC_CONNECTION_ERROR, {
                        error: err.message
                    });
                    return;
                }

                const { title, width, heigth } = rfbClient as any;
                client.emit(EVENTS_MESSAGES.VNC_CONNECTION_SUCCESS, {
                    info: { title, width, heigth }
                });

                _addListeners(client, rfbClient);
            });
        });
    });
};
