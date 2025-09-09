import Joi from 'joi';

/**
 * Validation schema for campus query parameters
 */
export const campusQuerySchema = Joi.object({
  includeServices: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'includeServices must be a boolean value'
    }),
  serviceType: Joi.string()
    .valid('academic', 'administrative', 'recreational', 'dining', 'health', 'library', 'parking')
    .optional()
    .messages({
      'any.only': 'Service type must be one of: academic, administrative, recreational, dining, health, library, parking'
    }),
  buildingId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Building ID must be a string'
    })
});

/**
 * Validation schema for campus ID parameter
 */
export const campusParamSchema = Joi.object({
  campusId: Joi.string()
    .required()
    .messages({
      'any.required': 'Campus ID is required',
      'string.base': 'Campus ID must be a string'
    })
});

/**
 * Validation schema for building/location search
 */
export const locationSearchSchema = Joi.object({
  query: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Search query must be at least 2 characters long',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required'
    }),
  type: Joi.string()
    .valid('building', 'service', 'all')
    .optional()
    .default('all')
    .messages({
      'any.only': 'Search type must be one of: building, service, all'
    })
});