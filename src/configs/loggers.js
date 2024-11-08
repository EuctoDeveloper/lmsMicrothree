// use winston and config file to generate logs on the Application, It export the logger to use it accross


import { createLogger, format, transports } from 'winston';
import config from './config.js'; // Ensure .js extension is included
const { combine, timestamp, prettyPrint } = format;

const { NODE_ENV } = config;

const logger = createLogger({
    level: NODE_ENV === 'development' ? 'debug' : 'info',
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
    ],
});

export default logger;
