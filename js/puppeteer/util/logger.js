const path = require('path');
const winston = require('winston');

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, label } = format;

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'MyAppLabel' }), 
    timestamp(), 
    format.json()
  ),
  transports: [
    new transports.Console({
      format: combine(
        format.colorize(), 
        printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
    new transports.File({
      filename: './logs/debug.log',
      level: 'debug',
      format: combine(
        printf(({ level, message, label, timestamp }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        })
      )
    })
  ],
  exceptionHandlers: [
    new transports.Console({
      format: format.simple() // For exceptions, simple formatting
    }),
    new transports.File({
      filename: './logs/exceptions.log',
      format: format.simple() // Consistent format for file-based exceptions
    })
  ],
  exitOnError: false,
  silent: false
});

module.exports = logger;

