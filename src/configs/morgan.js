// This file is to generate Morgan Logs For success and error Handler with User's IpAddress and export success and error handler as default

import morgan from 'morgan';
import logger from './loggers.js';

const successLogFormat = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
const errorLogFormat = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length] ":referrer" ":user-agent"';

const successHandler = morgan(successLogFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.info(message.trim()) }
});

const errorHandler = morgan(errorLogFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.error(message.trim()) }
});

export default { successHandler, errorHandler };