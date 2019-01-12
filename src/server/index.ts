import * as express from 'express';
import { resolve, join } from 'path';
import { path as rootPath } from 'app-root-path';
import socket from './sockets';

console.info(`[VNC CLIENT] Starting...`);

const host = process.env.APP_HOST;
const port = Number(process.env.APP_PORT);
const app = express();

app.use('/assets', express.static(resolve(rootPath, 'dist/client/assets')));
app.get('/', (_, res) => {
    res.sendFile(join(rootPath, 'dist/client/index.html'));
});

const server = app.listen(port, host, () => {
    socket(server);
    console.info(`[VNC CLIENT] Started with success!`);
    console.info(` * Listening at http://${host}:${port}`);
});
