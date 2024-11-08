// this file will export the function that contains a promise, which will collect a function as input and will try to resolve the function passed and catch it if it fails.
import CustomError from "./CustomError.js";
import logger from "../configs/loggers.js";
import httpStatus from "http-status";

const catcher = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        logger.error(err instanceof Error ? err.stack : err);

        if (err instanceof CustomError) {
            logger.error(`Custom Error: ${err.message}`);
            res.status(err.code).json({
                status: 'error',
                message: err.message,
                data: err.data
            });
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: "Something went wrong!" });
        }
    });
};

export default catcher;