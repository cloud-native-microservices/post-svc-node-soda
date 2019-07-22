const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
    userId: Joi.string().alphanum().required(),
    title: Joi.string().max(300).required(),
    type: Joi.string().allow('text', 'link', 'image', 'video').required(),
    content: Joi.string().max(2000),
    postedOn: Joi.date().default(Date.now, 'postedOn timestamp').required(),
});

const options = {
    "abortEarly": false,
    "allowUnknown": true,
};

module.exports = {
    schema: schema,
    options: options,
};