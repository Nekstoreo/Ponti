import Joi from 'joi';

/**
 * Validation schema for schedule query parameters
 */
export const scheduleQuerySchema = Joi.object({
  periodId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Period ID must be a string'
    }),
  includeDetails: Joi.boolean()
    .optional()
    .default(true)
});

/**
 * Validation schema for day parameter in schedule routes
 */
export const dayParamSchema = Joi.object({
  day: Joi.string()
    .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    .required()
    .messages({
      'any.only': 'Day must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday',
      'any.required': 'Day parameter is required'
    })
});

/**
 * Validation schema for date-based schedule queries
 */
export const dateRangeQuerySchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after start date'
    })
});