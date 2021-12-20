import winston from 'winston';
import { format } from 'winston'
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'basic.log' }),
  ],
});


export const fileLogger = (level: string, message: string) => {
  logger.log({ level: level, message: message })
}