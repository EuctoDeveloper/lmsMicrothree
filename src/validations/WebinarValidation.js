import Joi from "joi";

export const getMyWebinarsSchema = {
    query: Joi.object({
        date: Joi.date().optional()
    }),
    body: Joi.object().optional()
};

export const getWebinarByIdSchema = {
    params: Joi.object({
        id: Joi.string().required()
    }),
    body: Joi.object().optional()
};