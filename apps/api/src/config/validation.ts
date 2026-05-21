import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  ADMIN_DATABASE_URL: Joi.string().optional(),
  AGENT_DATABASE_URL: Joi.string().optional(),
  ADMIN_ACCESS_KEY: Joi.string().min(8).optional(),
  ADMIN_SIGNUP_SECRET: Joi.string().min(8).optional(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  FILE_BASE_URL: Joi.string().uri().optional(),
  FILE_BUCKET: Joi.string().optional(),
});
