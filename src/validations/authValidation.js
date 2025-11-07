import { Joi, Segments } from 'celebrate';
import { emailRegexp } from '../constants/regexps.js';

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
  }),
};
