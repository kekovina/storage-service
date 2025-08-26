import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number(),
  BEARER_TOKENS: Joi.string().required(),
});

export default validationSchema;
