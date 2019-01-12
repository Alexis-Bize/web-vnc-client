import { Socket } from 'socket.io';

export type ClientId = string;
export interface IClients {
    [key: string]: Socket;
}
