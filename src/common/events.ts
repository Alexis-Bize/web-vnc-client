import { IEventsConstants } from './typings/events';

export const EVENTS_MESSAGES: IEventsConstants = {
    WELCOME: 'messages:welcome',
    VNC_CONNECTION_SUCCESS: 'messages:vnc:connection-success',
    VNC_CONNECTION_ERROR: 'messages:vnc:connection-error'
};

export const EVENTS_DISPATCH: IEventsConstants = {
    CLIENT_READY: 'dispatch:client:ready',
    MOUSE_MOVE: 'dispatch:mouse:move',
    KEYBOARD_PRESS: 'dispatch:keyboard:press',
    VNC_FRAME: 'dispatch:vnc:frame'
};

export const EVENTS_ACTIONS: IEventsConstants = {
    VNC_CONNECT: 'actions:vnc:connect',
    VNC_DISCONNECT: 'actions:vnc:disconnect'
};
