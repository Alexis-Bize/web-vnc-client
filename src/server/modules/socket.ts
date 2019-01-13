import * as io from 'socket.io';
import { Server } from 'http';
import { startRfbClient } from './rfb';
import { ClientId, IClients } from '../../common/sockets';
import { EVENTS_MESSAGES, EVENTS_ACTIONS } from '../../common/events';
import { addListeners } from './listeners';
import { RfbClient } from 'rfb2';

import {
    IRfbCredentials,
    IWelcomeMessage,
    IClientInfo
} from '../../common/typings/events';

const _clients: IClients = {};

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
            console.info(`[${clientId}] Client left`);
            _clients[clientId].socket.disconnect();
            _clients[clientId].rfbClient && _clients[clientId].rfbClient.end();
            delete _clients[clientId];
        });

        s.emit(EVENTS_MESSAGES.WELCOME, {
            id: clientId
        } as IWelcomeMessage);

        s.on(EVENTS_ACTIONS.VNC_CONNECT, (message: IRfbCredentials) => {
            console.info(`[${clientId}] Starting RfbClient...`);
            startRfbClient(message, (err: any, rfbClient: RfbClient) => {
                if (err === null) {
                    console.info(`[${clientId}] RfbClient started`);
                    _clients[clientId].rfbClient = rfbClient;

                    const r = _clients[clientId].rfbClient;
                    const { title, width, height } = rfbClient as any;
                    const clientInfo: IClientInfo = { title, width, height };

                    s.emit(EVENTS_MESSAGES.VNC_CONNECTION_SUCCESS, clientInfo);
                    addListeners(s, r, clientInfo);
                    return;
                }

                s.emit(EVENTS_MESSAGES.VNC_CONNECTION_FAILED, {
                    error: err.message
                });
            });
        });
    });
};
