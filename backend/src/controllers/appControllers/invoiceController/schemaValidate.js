const Joi = require('joi');
const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string().required(),
  note: Joi.string().allow(''),
  expiredDate: Joi.date().required(),
  date: Joi.date().required(),
  // array cannot be empty
  items: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().allow('').optional(),
        itemName: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        description: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        quantity: Joi.number().required(),
        price: Joi.number().required(),
        total: Joi.number().required(),
        discount: Joi.number().allow(0).optional(), // Agregar la propiedad "discount"
      }).required()
    )
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
  recargo: Joi.number().optional(), // Nuevo campo "recargo"
  
});

module.exports = schema;
