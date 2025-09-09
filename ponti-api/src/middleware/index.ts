// Authentication middleware
export {
  authenticateToken,
  extractStudentId,
  optionalAuth,
  requireAcademicStatus,
  requireCampus,
  requireSelfAccess,
} from './auth';

// Security middleware
export {
  generalRateLimit,
  authRateLimit,
  passwordRateLimit,
  securityHeaders,
  additionalSecurity,
  sanitizeHeaders,
  preventAttacks,
  configureTrustedProxies,
} from './security';

// Validation middleware
export {
  validateBody,
  validateParams,
  validateQuery,
  validate,
} from './validation';

// Error handling middleware
export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  successResponse,
} from './errorHandler';

// Response middleware
export {
  responseMiddleware,
} from './response';