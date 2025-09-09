import mongoose from 'mongoose';
import logger from './logger';
import config from './index';

// Database connection options optimized for MongoDB Atlas
const getConnectionOptions = (): mongoose.ConnectOptions => {
  const baseOptions: mongoose.ConnectOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    bufferCommands: false, // Disable mongoose buffering
  };

  // Additional options for production (MongoDB Atlas)
  if (config.server.env === 'production') {
    return {
      ...baseOptions,
      retryWrites: true,
      maxPoolSize: 20, // Higher pool size for production
      minPoolSize: 5, // Minimum connections to maintain
    };
  }

  return baseOptions;
};

// Connection retry configuration
const RETRY_CONFIG = {
  maxRetries: 5,
  retryDelayMs: 5000,
  backoffMultiplier: 2,
};

// Connection utility functions
export const getConnectionState = (): number => {
  return mongoose.connection.readyState;
};

export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

export const getConnectionInfo = () => {
  const connection = mongoose.connection;
  return {
    state: getConnectionState(),
    host: connection.host,
    port: connection.port,
    name: connection.name,
    collections: Object.keys(connection.collections),
  };
};

// Enhanced connection function with retry logic
export const connectDB = async (): Promise<void> => {
  let retryCount = 0;
  let lastError: Error | null = null;

  const attemptConnection = async (): Promise<mongoose.Connection> => {
    try {
      logger.info(`🔄 Attempting to connect to MongoDB (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1})`);
      
      const mongoURI = config.database.uri;
      const options = getConnectionOptions();

      // Log connection details (without sensitive info)
      const uriParts = mongoURI.split('@');
      const safeUri = uriParts.length > 1 ? `mongodb://***@${uriParts[1]}` : mongoURI;
      logger.info(`📍 Connecting to: ${safeUri}`);
      logger.info(`⚙️  Connection options: ${JSON.stringify(options, null, 2)}`);

      const conn = await mongoose.connect(mongoURI, options);
      
      logger.info(`🍃 MongoDB Connected Successfully!`);
      logger.info(`📊 Connection Details:`, {
        host: conn.connection.host,
        port: conn.connection.port,
        database: conn.connection.name,
        readyState: conn.connection.readyState,
      });

      return conn.connection;
    } catch (error) {
      lastError = error as Error;
      logger.error(`❌ MongoDB connection attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = RETRY_CONFIG.retryDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
        logger.info(`⏳ Retrying connection in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
        return attemptConnection();
      } else {
        throw new Error(`Failed to connect to MongoDB after ${RETRY_CONFIG.maxRetries + 1} attempts. Last error: ${lastError?.message}`);
      }
    }
  };

  try {
    await attemptConnection();
    setupConnectionEventHandlers();
  } catch (error) {
    logger.error('🚨 Critical: Unable to establish database connection:', error);
    throw error;
  }
};

// Setup connection event handlers
const setupConnectionEventHandlers = (): void => {
  const connection = mongoose.connection;

  // Connection opened
  connection.on('connected', () => {
    logger.info('🟢 MongoDB connection established');
  });

  // Connection error
  connection.on('error', (error) => {
    logger.error('🔴 MongoDB connection error:', error);
  });

  // Connection disconnected
  connection.on('disconnected', () => {
    logger.warn('🟡 MongoDB connection lost');
  });

  // Connection reconnected
  connection.on('reconnected', () => {
    logger.info('🔄 MongoDB reconnected');
  });

  // Connection close
  connection.on('close', () => {
    logger.info('🔒 MongoDB connection closed');
  });

  // MongoDB driver events
  connection.on('fullsetup', () => {
    logger.info('🎯 MongoDB replica set fully connected');
  });

  connection.on('all', () => {
    logger.info('🌐 MongoDB connected to all servers');
  });

  // Process termination handlers
  const gracefulShutdown = async (signal: string) => {
    logger.info(`📡 ${signal} received, closing MongoDB connection...`);
    try {
      await mongoose.connection.close();
      logger.info('✅ MongoDB connection closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon
};

// Disconnect function for testing and cleanup
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('🔌 MongoDB disconnected successfully');
  } catch (error) {
    logger.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    state: number;
    host?: string;
    database?: string;
    ping?: number;
    error?: string;
  };
}> => {
  try {
    const startTime = Date.now();
    
    // Check connection state
    const state = getConnectionState();
    if (state !== 1) { // 1 = connected
      return {
        status: 'unhealthy',
        details: {
          state,
          error: 'Database not connected',
        },
      };
    }

    // Ping database
    await mongoose.connection.db?.admin().ping();
    const pingTime = Date.now() - startTime;

    return {
      status: 'healthy',
      details: {
        state,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        ping: pingTime,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        state: getConnectionState(),
        error: (error as Error).message,
      },
    };
  }
};

export default mongoose;
