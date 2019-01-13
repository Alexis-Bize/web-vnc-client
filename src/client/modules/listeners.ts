import { render, destroy, draw } from './screen';
import { IListeners } from '../typings/listeners';

import {
    EVENTS_ACTIONS,
    EVENTS_DISPATCH,
    EVENTS_MESSAGES
} from '../../common/events';

import {
    IMouseMove,
    IRfbCredentials,
    IVncFrameMetadata,
    IKeyboardPress
} from '../../common/typings/events';

const _listeners: IListeners = {};

export const removeAllListeners = () => {
    document.removeEventListener('mousemove', _listeners.mouseMoveListener);
    document.removeEventListener('keydown', _listeners.keyDownListener);
    document.removeEventListener('keyup', _listeners.keyUpListener);
};

export const addListeners = (socket: SocketIOClient.Socket) => {
    document
        .getElementById('form-wrapper')
        .addEventListener('submit', event => {
            event && event.preventDefault();

            const VNCHost = document.getElementById('vnc_host') as any;
            const VNCPort = document.getElementById('vnc_port') as any;
            const VNCPassword = document.getElementById('vnc_password') as any;

            socket.emit(EVENTS_ACTIONS.VNC_CONNECT, {
                host: VNCHost.value,
                port: VNCPort.value,
                password: VNCPassword.value
            } as IRfbCredentials);
        });

    socket.on(EVENTS_MESSAGES.VNC_CONNECTION_SUCCESS, (payload: any) => {
        const screen = render(payload);
        const context = screen.getContext('2d');

        _listeners.mouseMoveListener = (event: MouseEvent) => {
            socket.emit(EVENTS_DISPATCH.MOUSE_MOVE, {
                clientX: event.clientX,
                clientY: event.clientY,
                buttons: event.buttons
            } as IMouseMove);
        };

        _listeners.keyDownListener = (event: KeyboardEvent) => {
            socket.emit(EVENTS_DISPATCH.KEYBOARD_ACTION, {
                keyCode: event.keyCode,
                isDown: true
            } as IKeyboardPress);
        };

        _listeners.keyUpListener = (event: KeyboardEvent) => {
            socket.emit(EVENTS_DISPATCH.KEYBOARD_ACTION, {
                keyCode: event.keyCode,
                isDown: false
            } as IKeyboardPress);
        };

        document.addEventListener('mousemove', _listeners.mouseMoveListener);
        document.addEventListener('keydown', _listeners.keyDownListener);
        document.addEventListener('keyup', _listeners.keyUpListener);

        socket.on(EVENTS_DISPATCH.VNC_FRAME, (payload: IVncFrameMetadata) => {
            draw(context, payload);
        });

        socket.emit(EVENTS_DISPATCH.CLIENT_READY);
    });

    socket.on(EVENTS_MESSAGES.VNC_CONNECTION_FAILED, (payload: any) => {
        alert(payload.error);
    });

    socket.on(EVENTS_MESSAGES.VNC_CLIENT_ERROR, (payload: any) => {
        alert(payload.error);
        removeAllListeners();
        destroy();
        socket.emit(EVENTS_ACTIONS.VNC_DISCONNECT);
    });
};
