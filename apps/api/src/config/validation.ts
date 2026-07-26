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
  ENCRYPTION_KEY: Joi.string().hex().length(64).required(),
  CORS_ORIGINS: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_STORAGE_BUCKET: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  ENABLE_SWAGGER: Joi.boolean().default(false),
});
