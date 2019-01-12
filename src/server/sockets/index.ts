import * as io from 'socket.io';
import { Server } from 'http';
import { createRfbClient } from './modules/rfb';
import { ClientId, IClients } from '../../common/sockets';
import { RfbClient } from 'rfb2';

import {
    IRfbCredentials,
    IMouseMove,
    IKeyboardPress,
    IWelcomeMessage,
    IVncFrameMetadata
} from '../../common/typings/events';

import {
    EVENTS_MESSAGES,
    EVENTS_ACTIONS,
    EVENTS_DISPATCH
} from '../../common/events';

const _clients: IClients = {};

const _addListeners = (
    socket: io.Socket,
    rfbClient: RfbClient,
    clientId: ClientId
) => {
    socket.on(EVENTS_DISPATCH.CLIENT_READY, () => {
        // Socket
        socket.on(EVENTS_DISPATCH.MOUSE_MOVE, (payload: IMouseMove) => {
            const { clientX, clientY, buttons } = payload;
            // @ts-ignore: Bad typing
            rfbClient.pointerEvent(clientX, clientY, buttons);
        });

        socket.on(
            EVENTS_DISPATCH.KEYBOARD_ACTION,
            (payload: IKeyboardPress) => {
                const { keyCode, isDown } = payload;
                // @ts-ignore: Bad typing
                rfbClient.keyEvent(keyCode, isDown);
            }
        );

        socket.on(EVENTS_ACTIONS.VNC_DISCONNECT, () => {
            rfbClient.end();
        });

        // Rfb
        rfbClient.on('rect', (rect: any) => {
            const { x, y, width, height } = rect;
            const payload: IVncFrameMetadata = { x, y, width, height, rect };
            socket.send(EVENTS_DISPATCH.VNC_FRAME_RECEIVED, payload);
        });

        rfbClient.on('error', (err: Error) => {
            socket.emit(EVENTS_MESSAGES.VNC_CLIENT_ERROR, {
                error: err.message
            });
        });
    });
};

export const createSocketServer = (server: Server): void => {
    io(server).on('connection', socket => {
        const clientId: ClientId = socket.id;

        if (_clients[clientId] === void 0) {
            console.info(`[${clientId}] Client joined`);
        } else return;

        _clients[clientId] = {
            socket,
            rfbClient: null
        };

        const s = _clients[clientId].socket;

        s.on('disconnect', () => {
            _clients[clientId].socket.disconnect();
            _clients[clientId].rfbClient && _clients[clientId].rfbClient.end();
            delete _clients[clientId];
        });

        s.emit(EVENTS_MESSAGES.WELCOME, {
            id: clientId
        } as IWelcomeMessage);

        s.on(EVENTS_ACTIONS.VNC_CONNECT, (message: IRfbCredentials) => {
            console.info(`[${clientId}] Starting Rfb client...`);

            createRfbClient(message, (err: any, rfbClient: RfbClient) => {
                if (err !== null) {
                    s.emit(EVENTS_MESSAGES.VNC_CONNECTION_FAILED, {
                        error: err.message
                    });
                    return;
                } else console.info(`[${clientId}] Rfb client started!`);

                _clients[clientId].rfbClient = rfbClient;

                const r = _clients[clientId].rfbClient;
                const { title, width, height } = rfbClient as any;

                s.emit(EVENTS_MESSAGES.VNC_CONNECTION_SUCCESS, {
                    info: { title, width, height }
                });

                _addListeners(s, r, clientId);
            });
        });
    });
};
