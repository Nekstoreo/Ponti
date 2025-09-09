import Joi from 'joi';

/**
 * Validation schema for student login
 */
export const loginSchema = Joi.object({
  studentId: Joi.string()
    .required()
    .pattern(/^\d{9}$/)
    .messages({
      'string.pattern.base': 'Student ID must be exactly 9 digits',
      'any.required': 'Student ID is required'
    }),
  password: Joi.string()
    .required()
    .min(6)
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
});

/**
 * Validation schema for token refresh
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});