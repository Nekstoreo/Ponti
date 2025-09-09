import winston from 'winston';
import config from './index';

const { combine, timestamp, errors, json, simple, colorize, printf, splat } = winston.format;

// Custom format for development
const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    // Add stack trace if present
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Production format with structured logging
const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: config.server.env === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { 
    service: 'ponti-api',
    environment: config.server.env,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    new winston.transports.Console({
      silent: config.server.env === 'test',
    }),
  ],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

// Add file transports for production
if (config.server.env === 'production') {
  // Error logs
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Combined logs
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Security logs for authentication/authorization events
  logger.add(
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true,
    })
  );

  // Add file handlers for exceptions and rejections
  logger.exceptions.handle(
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      maxsize: 5242880,
      maxFiles: 5,
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: 'logs/rejections.log',
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

export { logger };
export default logger;
