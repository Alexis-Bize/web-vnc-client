import * as rfb2 from 'rfb2';
import { IRfbCredentials } from '../../../common/typings/events';

export const createRfbClient = (
    credentials: IRfbCredentials,
    callback: Function
): void => {
    const rfbClient: rfb2.RfbClient = rfb2.createConnection(credentials);

    // prettier-ignore
    rfbClient.on('error', err => {
        callback(err);
    }).on('connect', () => {
        callback(null, rfbClient);
    });
};
