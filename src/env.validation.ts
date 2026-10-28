import * as Joi from 'joi';
import { CACHE_FOLDER_PATH } from '@/storage/config';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number(),
  BEARER_TOKENS: Joi.string().required(),

  ACCEPTED_MIME_TYPES: Joi.string(),

  MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024),

  IMAGE_MIN_SIZE: Joi.number().integer().min(1).max(Joi.ref('IMAGE_MAX_SIZE')).default(16),
  IMAGE_MAX_SIZE: Joi.number().integer().min(1).default(2048),
  CACHE_FOLDER_PATH: Joi.string().default(CACHE_FOLDER_PATH),

  SWAGGER_ENABLED: Joi.number().default(0),
});

export default validationSchema;
