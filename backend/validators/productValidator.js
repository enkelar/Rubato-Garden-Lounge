import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  nameSq: Joi.string().trim().max(100).allow('', null),
  description: Joi.string().trim().max(500).allow('', null),
  descriptionSq: Joi.string().trim().max(500).allow('', null),
  price: Joi.number().positive().precision(2).required(),
  image: Joi.string().uri().allow('', null),
  details: Joi.string().trim().max(1000).allow('', null),
  detailsSq: Joi.string().trim().max(1000).allow('', null),
  category: Joi.string().hex().length(24).required(),
});