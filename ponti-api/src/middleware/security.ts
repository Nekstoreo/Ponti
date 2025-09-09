import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { APIError, ErrorCodes } from '../types';

/**
 * General rate limiting middleware
 * Applies to all requests
 */
export const generalRateLimit = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15 minutes by default
  max: config.security.rateLimitMaxRequests, // 100 requests per window by default
  message: {
    success: false,
    error: {
      code: ErrorCodes.RATE_LIMIT_ERROR,
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    },
  } as APIError,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.RATE_LIMIT_ERROR,
        message: 'Too many requests from this IP, please try again later.',
        details: {
          limit: config.security.rateLimitMaxRequests,
          windowMs: config.security.rateLimitWindowMs,
          retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000),
        },
        timestamp: new Date().toISOString(),
      },
    };
    res.status(429).json(error);
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === config.monitoring.healthCheckPath || req.path.startsWith('/health');
  },
});

/**
 * Strict rate limiting for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per window
  message: {
    success: false,
    error: {
      code: ErrorCodes.RATE_LIMIT_ERROR,
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date().toISOString(),
    },
  } as APIError,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.RATE_LIMIT_ERROR,
        message: 'Too many authentication attempts from this IP, please try again later.',
        details: {
          limit: 5,
          windowMs: 15 * 60 * 1000,
          retryAfter: 15 * 60, // 15 minutes in seconds
        },
        timestamp: new Date().toISOString(),
      },
    };
    res.status(429).json(error);
  },
});

/**
 * Rate limiting for password-related operations
 * Very restrictive to prevent password attacks
 */
export const passwordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password change attempts per hour
  message: {
    success: false,
    error: {
      code: ErrorCodes.RATE_LIMIT_ERROR,
      message: 'Too many password change attempts, please try again later.',
      timestamp: new Date().toISOString(),
    },
  } as APIError,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.RATE_LIMIT_ERROR,
        message: 'Too many password change attempts from this IP, please try again later.',
        details: {
          limit: 3,
          windowMs: 60 * 60 * 1000,
          retryAfter: 60 * 60, // 1 hour in seconds
        },
        timestamp: new Date().toISOString(),
      },
    };
    res.status(429).json(error);
  },
});

/**
 * Security headers middleware using Helmet
 * Configures various security headers
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frameguard (X-Frame-Options)
  frameguard: { action: 'deny' },
  
  // Hide Powered-By header
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff (X-Content-Type-Options)
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: { policy: "no-referrer" },
  
  // X-XSS-Protection
  xssFilter: true,
});

/**
 * Custom security middleware for additional protections
 */
export const additionalSecurity = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add custom security headers
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || 'unknown');
  
  // Remove sensitive headers that might leak information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Add cache control for sensitive endpoints
  if (req.path.includes('/auth') || req.path.includes('/profile')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

/**
 * Middleware to validate and sanitize request headers
 */
export const sanitizeHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove potentially dangerous headers
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-server'];
  
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      const error: APIError = {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Content-Type must be application/json',
          timestamp: new Date().toISOString(),
        },
      };
      res.status(400).json(error);
      return;
    }
  }
  
  // Validate User-Agent (basic check)
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.length > 500) {
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid or missing User-Agent header',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(400).json(error);
    return;
  }
  
  next();
};

/**
 * Middleware to prevent common attacks
 */
export const preventAttacks = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check for suspicious patterns in URL
  const suspiciousPatterns = [
    /\.\./,           // Directory traversal
    /<script/i,       // XSS attempts
    /javascript:/i,   // JavaScript protocol
    /vbscript:/i,     // VBScript protocol
    /onload=/i,       // Event handlers
    /onerror=/i,      // Event handlers
  ];
  
  const url = req.url.toLowerCase();
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      const error: APIError = {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Suspicious request detected',
          timestamp: new Date().toISOString(),
        },
      };
      res.status(400).json(error);
      return;
    }
  }
  
  // Check request body size (if body exists)
  if (req.body && JSON.stringify(req.body).length > 1024 * 1024) { // 1MB limit
    const error: APIError = {
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Request body too large',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(413).json(error);
    return;
  }
  
  next();
};

/**
 * Trusted proxy configuration
 */
export const configureTrustedProxies = (app: any): void => {
  if (config.security.trustedProxies.length > 0) {
    app.set('trust proxy', config.security.trustedProxies);
  } else if (config.server.env === 'production') {
    // In production, trust first proxy by default
    app.set('trust proxy', 1);
  }
};