import { Socket } from 'socket.io';
import { RfbClient } from 'rfb2';

export type ClientId = string;
export interface IClients {
    [key: string]: {
        socket: Socket;
        rfbClient?: RfbClient;
    };
}
