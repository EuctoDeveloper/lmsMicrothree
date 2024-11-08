// This file is validation middleware that uses JOI validartion to validate and this file accepts schema and export the validate function.

import Joi from "joi";
import { pick } from "../utils/pick.js";
const validateInput = (schema, passSchema=['body']) => (req, res, next) => {
    const validSchema = pick(schema, passSchema);
    const object = pick(req, Object.keys(validSchema));
    const { error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
};

export default validateInput;