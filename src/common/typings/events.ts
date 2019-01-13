import { ClientId } from '../sockets';

export interface IEventsConstants {
    [key: string]: string;
}

export interface IWelcomeMessage {
    id: ClientId;
}

export interface IRfbCredentials {
    host: string;
    port?: number;
    password?: string;
}

export interface IMouseMove {
    clientX: number;
    clientY: number;
    buttons: number;
}

export interface IKeyboardPress {
    keyCode: number;
    isDown: boolean;
}

export interface IVncFrameMetadata {
    x: number;
    y: number;
    width: number;
    height: number;
    b64img: string;
}

export interface IClientInfo {
    title: string;
    width: number;
    height: number;
}
