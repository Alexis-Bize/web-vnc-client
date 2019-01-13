import { IEventsConstants } from './typings/events';

export const EVENTS_MESSAGES: IEventsConstants = {
    WELCOME: 'messages:welcome',
    VNC_CONNECTION_SUCCESS: 'messages:vnc:connection-success',
    VNC_CONNECTION_FAILED: 'messages:vnc:connection-failed',
    VNC_CLIENT_ERROR: 'messages:vnc:client-error'
};

export const EVENTS_DISPATCH: IEventsConstants = {
    MOUSE_MOVE: 'dispatch:mouse:move',
    KEYBOARD_ACTION: 'dispatch:keyboard:action',
    CLIENT_READY: 'dispatch:client:ready',
    VNC_FRAME: 'dispatch:vnc:frame'
};

export const EVENTS_ACTIONS: IEventsConstants = {
    VNC_CONNECT: 'actions:vnc:connect',
    VNC_DISCONNECT: 'actions:vnc:disconnect'
};
