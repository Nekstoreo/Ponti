import mongoose from 'mongoose';
import logger from '../config/logger';
import { getConnectionState } from '../config/database';

/**
 * Wait for database connection to be established
 */
export const waitForConnection = async (timeoutMs: number = 30000): Promise<void> => {
  const startTime = Date.now();
  
  while (getConnectionState() !== 1) { // 1 = connected
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Database connection timeout after ${timeoutMs}ms`);
    }
    
    // Wait 100ms before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

/**
 * Execute a database operation with retry logic
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw new Error(`Database operation failed after ${maxRetries} attempts. Last error: ${lastError!.message}`);
};

/**
 * Create database indexes for a collection
 */
export const createIndexes = async (
  collectionName: string,
  indexes: Array<{
    fields: any;
    options?: any;
  }>
): Promise<void> => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    
    for (const index of indexes) {
      await collection.createIndex(index.fields, index.options);
      logger.info(`✅ Created index for ${collectionName}:`, index.fields);
    }
  } catch (error) {
    logger.error(`❌ Failed to create indexes for ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Drop all indexes for a collection (except _id)
 */
export const dropIndexes = async (collectionName: string): Promise<void> => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    await collection.dropIndexes();
    logger.info(`🗑️  Dropped all indexes for ${collectionName}`);
  } catch (error) {
    logger.error(`❌ Failed to drop indexes for ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get collection statistics
 */
export const getCollectionStats = async (collectionName: string): Promise<{
  count: number;
  size: number;
  avgObjSize: number;
  indexes: number;
}> => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    const stats = await (collection as any).stats();
    
    return {
      count: stats.count || 0,
      size: stats.size || 0,
      avgObjSize: stats.avgObjSize || 0,
      indexes: stats.nindexes || 0,
    };
  } catch (error) {
    logger.error(`❌ Failed to get stats for ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Check if a collection exists
 */
export const collectionExists = async (collectionName: string): Promise<boolean> => {
  try {
    const collections = await mongoose.connection.db?.listCollections({ name: collectionName }).toArray();
    return (collections?.length || 0) > 0;
  } catch (error) {
    logger.error(`❌ Failed to check if collection ${collectionName} exists:`, error);
    return false;
  }
};

/**
 * Drop a collection if it exists
 */
export const dropCollection = async (collectionName: string): Promise<void> => {
  try {
    const exists = await collectionExists(collectionName);
    if (exists) {
      await mongoose.connection.collection(collectionName).drop();
      logger.info(`🗑️  Dropped collection: ${collectionName}`);
    } else {
      logger.info(`ℹ️  Collection ${collectionName} does not exist, skipping drop`);
    }
  } catch (error) {
    logger.error(`❌ Failed to drop collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get database information
 */
export const getDatabaseInfo = async (): Promise<{
  name: string;
  collections: string[];
  size: number;
  version: string;
}> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const admin = db.admin();
    const [buildInfo, stats, collections] = await Promise.all([
      admin.buildInfo(),
      db.stats(),
      db.listCollections().toArray(),
    ]);

    return {
      name: mongoose.connection.name,
      collections: collections.map(col => col.name),
      size: stats.dataSize || 0,
      version: buildInfo.version,
    };
  } catch (error) {
    logger.error('❌ Failed to get database info:', error);
    throw error;
  }
};

/**
 * Validate database connection and permissions
 */
export const validateDatabaseConnection = async (): Promise<{
  connected: boolean;
  readable: boolean;
  writable: boolean;
  error?: string;
}> => {
  try {
    // Check connection
    if (getConnectionState() !== 1) { // 1 = connected
      return {
        connected: false,
        readable: false,
        writable: false,
        error: 'Database not connected',
      };
    }

    // Test read permission
    let readable = false;
    try {
      await mongoose.connection.db?.admin().ping();
      readable = true;
    } catch (error) {
      logger.warn('Database read test failed:', error);
    }

    // Test write permission
    let writable = false;
    try {
      const testCollection = mongoose.connection.collection('_connection_test');
      await testCollection.insertOne({ test: true, timestamp: new Date() });
      await testCollection.deleteOne({ test: true });
      writable = true;
    } catch (error) {
      logger.warn('Database write test failed:', error);
    }

    return {
      connected: true,
      readable,
      writable,
    };
  } catch (error) {
    return {
      connected: false,
      readable: false,
      writable: false,
      error: (error as Error).message,
    };
  }
};