import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Also load default .env file as fallback
dotenv.config();

interface DatabaseConfig {
  uri: string;
  options: {
    maxPoolSize: number;
    minPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    retryWrites: boolean;
  };
}

interface Config {
  server: {
    port: number;
    env: string;
    host: string;
  };
  database: DatabaseConfig;
  jwt: {
    secret: string;
    expiresIn: string;
    algorithm: string;
  };
  security: {
    bcryptSaltRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    corsOrigins: string[];
    trustedProxies: string[];
  };
  logging: {
    level: string;
    enableFileLogging: boolean;
    maxFileSize: string;
    maxFiles: number;
  };
  monitoring: {
    enableHealthChecks: boolean;
    healthCheckPath: string;
  };
}

// Environment-specific database URIs
const getDatabaseConfig = (): DatabaseConfig => {
  const env = process.env.NODE_ENV || 'development';
  let uri: string;

  switch (env) {
    case 'production':
      uri = process.env.MONGODB_URI || '';
      break;
    case 'test':
      uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ponti-test';
      break;
    case 'staging':
      uri = process.env.MONGODB_STAGING_URI || process.env.MONGODB_URI || '';
      break;
    default: // development
      uri = process.env.MONGODB_DEV_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ponti-dev';
  }

  // MongoDB Atlas optimized options
  const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');
  
  return {
    uri,
    options: {
      maxPoolSize: env === 'production' ? 20 : 10,
      minPoolSize: env === 'production' ? 5 : 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: isAtlas, // Enable retry writes for Atlas
    },
  };
};

// Parse CORS origins
const parseCorsOrigins = (origins: string): string[] => {
  return origins.split(',').map(origin => origin.trim()).filter(Boolean);
};

// Parse trusted proxies
const parseTrustedProxies = (proxies: string): string[] => {
  return proxies.split(',').map(proxy => proxy.trim()).filter(Boolean);
};

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
  },
  database: getDatabaseConfig(),
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3001'),
    trustedProxies: parseTrustedProxies(process.env.TRUSTED_PROXIES || ''),
  },
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true' || process.env.NODE_ENV === 'production',
    maxFileSize: process.env.LOG_MAX_FILE_SIZE || '5m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  },
  monitoring: {
    enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
  },
};

// Environment validation
const validateConfig = (): void => {
  const errors: string[] = [];

  // Validate database URI
  if (!config.database.uri) {
    errors.push('Database URI is required (MONGODB_URI)');
  }

  // Validate JWT secret in production
  if (config.server.env === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }

    if (config.jwt.secret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production');
    }
  }

  // Validate port
  if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  // Validate bcrypt salt rounds
  if (config.security.bcryptSaltRounds < 10 || config.security.bcryptSaltRounds > 15) {
    errors.push('BCRYPT_SALT_ROUNDS must be between 10 and 15');
  }

  // Validate rate limiting
  if (config.security.rateLimitWindowMs < 60000) { // Minimum 1 minute
    errors.push('RATE_LIMIT_WINDOW_MS must be at least 60000 (1 minute)');
  }

  if (config.security.rateLimitMaxRequests < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be at least 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Validate configuration on load
validateConfig();

// Log configuration (without sensitive data)
const logConfig = () => {
  const safeConfig = {
    server: config.server,
    database: {
      uri: config.database.uri.replace(/\/\/[^@]+@/, '//***:***@'), // Hide credentials
      options: config.database.options,
    },
    jwt: {
      algorithm: config.jwt.algorithm,
      expiresIn: config.jwt.expiresIn,
      secretLength: config.jwt.secret.length,
    },
    security: {
      bcryptSaltRounds: config.security.bcryptSaltRounds,
      rateLimitWindowMs: config.security.rateLimitWindowMs,
      rateLimitMaxRequests: config.security.rateLimitMaxRequests,
      corsOrigins: config.security.corsOrigins,
      trustedProxiesCount: config.security.trustedProxies.length,
    },
    logging: config.logging,
    monitoring: config.monitoring,
  };

  console.log('📋 Configuration loaded:', JSON.stringify(safeConfig, null, 2));
};

// Log configuration in development
if (config.server.env === 'development') {
  logConfig();
}

export default config;
