import * as io from 'socket.io-client';
import { EVENTS_MESSAGES } from '../../common/events';
import { addListeners } from './listeners';

export const initializeSocket = () => {
    const host = process.env.APP_HOST;
    const port = Number(process.env.APP_PORT);
    const socket = io.connect(`http://${host}:${port}`);

    // prettier-ignore
    socket.on('connect', () => {
        socket.on(EVENTS_MESSAGES.WELCOME, () => {
            console.info('[VNC CLIENT] Ready to rumble!');
            addListeners(socket);
        });
    });
};
