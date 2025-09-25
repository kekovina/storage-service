import { supportedMimeTypes } from '@/consts';

export function getAcceptedMIMETypes(): string[] {
  const acceptedMimeTypes = process.env.ACCEPTED_MIME_TYPES;
  if (acceptedMimeTypes) {
    return acceptedMimeTypes.split(',').map((type) => type.trim());
  }
  return supportedMimeTypes;
}
