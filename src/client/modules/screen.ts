import { IVncFrameMetadata } from '../../common/typings/events';

export const render = (payload?: any): HTMLCanvasElement => {
    const form = document.getElementById('form-wrapper');
    form.style.display = 'none';

    const canvas = document.createElement('canvas');
    canvas.width = 1980;
    canvas.height = 1080;

    canvas.id = 'screen-wrapper';
    document.body.appendChild(canvas);

    return canvas;
};

export const draw = (
    context: CanvasRenderingContext2D,
    payload: IVncFrameMetadata
) => {
    const img = new Image();
    const { x, y, width, height, b64img } = payload;

    img.width = width;
    img.height = height;
    img.src = b64img;

    img.onload = () => context.drawImage(img, x, y, width, height);
};
