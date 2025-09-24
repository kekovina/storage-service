import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number(),
  BEARER_TOKENS: Joi.string().required(),

  ACCEPTED_MIME_TYPES: Joi.string()
    .required()
    .default(
      'application/pdf,image/png,image/jpeg,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg'
    ),

  MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024),

  SWAGGER_ENABLED: Joi.number().default(0),
});

export default validationSchema;
