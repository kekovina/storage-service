import { DefaultPrepareHandler } from './default';
import { PhotoPrepareHandler } from './photo';
import { VideoPrepareHandler } from './video';

export const uploaderHandlers = [DefaultPrepareHandler, PhotoPrepareHandler, VideoPrepareHandler];
