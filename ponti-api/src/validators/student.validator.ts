import Joi from 'joi';

/**
 * Validation schema for student preferences update
 */
export const updatePreferencesSchema = Joi.object({
  notifications: Joi.object({
    classReminders: Joi.boolean(),
    announcements: Joi.boolean(),
    grades: Joi.boolean()
  }).optional(),
  theme: Joi.string()
    .valid('light', 'dark')
    .optional()
    .messages({
      'any.only': 'Theme must be either "light" or "dark"'
    }),
  language: Joi.string()
    .valid('es', 'en')
    .optional()
    .messages({
      'any.only': 'Language must be either "es" or "en"'
    })
}).min(1).messages({
  'object.min': 'At least one preference field must be provided'
});

/**
 * Validation schema for student profile update (if needed in the future)
 */
export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    })
}).min(1).messages({
  'object.min': 'At least one profile field must be provided'
});