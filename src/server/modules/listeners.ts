import * as pngjs from 'pngjs';
import { Socket } from 'socket.io';
import { RfbClient } from 'rfb2';

import {
    IMouseMove,
    IKeyboardPress,
    IVncFrameMetadata,
    IClientInfo
} from '../../common/typings/events';

import {
    EVENTS_DISPATCH,
    EVENTS_ACTIONS,
    EVENTS_MESSAGES
} from '../../common/events';

export const addListeners = (
    socket: Socket,
    rfbClient: RfbClient,
    clientInfo: IClientInfo
) => {
    socket.on(EVENTS_DISPATCH.CLIENT_READY, () => {
        const requestInterval: NodeJS.Timeout = setInterval(() => {
            const { width, height } = clientInfo;
            rfbClient.requestUpdate(true, 0, 0, width, height);
        }, 4);

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
            clearInterval(requestInterval);
            rfbClient.end();
        });

        rfbClient.on('rect', (rect: any) => {
            const { x, y, width, height, data } = rect;
            const payload = { x, y, width, height } as IVncFrameMetadata;

            const png = new pngjs.PNG({ width, height });
            png.data = data;

            const buffer = pngjs.PNG.sync.write(png, {
                colorType: 0
            });

            payload.b64img = `data:image/png;base64${Buffer.from(
                buffer
            ).toString('base64')}`;

            socket.emit(EVENTS_DISPATCH.VNC_FRAME, payload);
        });

        rfbClient.on('error', (err: Error) => {
            socket.emit(EVENTS_MESSAGES.VNC_CLIENT_ERROR, {
                error: err.message
            });
        });
    });
};
