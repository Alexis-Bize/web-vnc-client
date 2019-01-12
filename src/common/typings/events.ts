export interface IEventsConstants {
    [key: string]: string;
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
    keyId: number;
}
