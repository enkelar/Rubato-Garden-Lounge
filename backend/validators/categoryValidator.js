import Joi from 'joi';

export const categorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(80).required(),
  nameSq: Joi.string().trim().max(80).allow('', null),
  icon: Joi.string().trim().max(10).allow('', null),
  cover: Joi.string().uri().allow('', null),
  note: Joi.string().trim().max(200).allow('', null),
  noteSq: Joi.string().trim().max(200).allow('', null),
});