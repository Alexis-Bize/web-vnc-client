import * as Jimp from 'jimp';
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
        }, 10);

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
            new Jimp(
                { data, width, height },
                (jimpErr: Error = null, image: Jimp) => {
                    if (jimpErr !== null) {
                        socket.emit(EVENTS_MESSAGES.VNC_CLIENT_ERROR, {
                            error: jimpErr.message
                        });
                        return;
                    }

                    image.getBase64(
                        Jimp.MIME_PNG,
                        (b64Err: Error = null, b64img: string) => {
                            if (b64Err !== null) {
                                socket.emit(EVENTS_MESSAGES.VNC_CLIENT_ERROR, {
                                    error: b64Err.message
                                });
                                return;
                            }

                            socket.emit(EVENTS_DISPATCH.VNC_FRAME, {
                                x,
                                y,
                                width,
                                height,
                                b64img
                            } as IVncFrameMetadata);
                        }
                    );
                }
            );
        });

        rfbClient.on('error', (err: Error) => {
            socket.emit(EVENTS_MESSAGES.VNC_CLIENT_ERROR, {
                error: err.message
            });
        });
    });
};
