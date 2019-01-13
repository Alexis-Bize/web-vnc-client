import * as rfb2 from 'rfb2';
import { IRfbCredentials } from '../../common/typings/events';

export const startRfbClient = (
    credentials: IRfbCredentials,
    callback: Function
): void => {
    credentials.port = credentials.port || 5900;
    credentials.password = credentials.password || void 0;

    const rfbClient: rfb2.RfbClient = rfb2.createConnection({
        ...credentials,
        encodings: [
            rfb2.encodings.raw,
            rfb2.encodings.copyRect,
            rfb2.encodings.pseudoDesktopSize
        ]
    });

    let hasTimedOut = false;

    const connectionTimeout: NodeJS.Timeout = setTimeout(() => {
        rfbClient.end();
        hasTimedOut = true;
        callback(new Error('Connection timeout'));
    }, 10000); // 10 seconds

    rfbClient.on('connect', () => {
        if (hasTimedOut === false) {
            clearTimeout(connectionTimeout);
            callback(null, rfbClient);
        } else rfbClient.end();
    });
};
