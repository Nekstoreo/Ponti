import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';
import { sanitizeInput } from '../utils/sanitizer';

/**
 * Validation middleware factory for request body validation
 */
export const validateBody = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Sanitize input before validation
      const sanitizedBody = sanitizeInput(req.body);
      
      const { error, value } = schema.validate(sanitizedBody, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        throw new ValidationError('Request body validation failed', validationErrors);
      }

      // Replace request body with validated and sanitized data
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validation middleware factory for request parameters validation
 */
export const validateParams = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Sanitize input before validation
      const sanitizedParams = sanitizeInput(req.params);
      
      const { error, value } = schema.validate(sanitizedParams, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        throw new ValidationError('Request parameters validation failed', validationErrors);
      }

      // Replace request params with validated and sanitized data
      req.params = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validation middleware factory for query parameters validation
 */
export const validateQuery = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Sanitize input before validation
      const sanitizedQuery = sanitizeInput(req.query);
      
      const { error, value } = schema.validate(sanitizedQuery, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        throw new ValidationError('Query parameters validation failed', validationErrors);
      }

      // Replace request query with validated and sanitized data
      req.query = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Combined validation middleware for multiple request parts
 */
export const validate = (schemas: {
  body?: Joi.Schema;
  params?: Joi.Schema;
  query?: Joi.Schema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: any[] = [];

      // Validate body if schema provided
      if (schemas.body) {
        const sanitizedBody = sanitizeInput(req.body);
        const { error, value } = schemas.body.validate(sanitizedBody, {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });

        if (error) {
          errors.push(...error.details.map(detail => ({
            field: `body.${detail.path.join('.')}`,
            message: detail.message,
            value: detail.context?.value
          })));
        } else {
          req.body = value;
        }
      }

      // Validate params if schema provided
      if (schemas.params) {
        const sanitizedParams = sanitizeInput(req.params);
        const { error, value } = schemas.params.validate(sanitizedParams, {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });

        if (error) {
          errors.push(...error.details.map(detail => ({
            field: `params.${detail.path.join('.')}`,
            message: detail.message,
            value: detail.context?.value
          })));
        } else {
          req.params = value;
        }
      }

      // Validate query if schema provided
      if (schemas.query) {
        const sanitizedQuery = sanitizeInput(req.query);
        const { error, value } = schemas.query.validate(sanitizedQuery, {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });

        if (error) {
          errors.push(...error.details.map(detail => ({
            field: `query.${detail.path.join('.')}`,
            message: detail.message,
            value: detail.context?.value
          })));
        } else {
          req.query = value;
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Request validation failed', errors);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};