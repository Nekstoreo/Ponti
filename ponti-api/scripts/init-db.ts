#!/usr/bin/env ts-node

import mongoose from 'mongoose';
import config from '../src/config';
import logger from '../src/config/logger';
import { connectDB, disconnectDB, checkDatabaseHealth } from '../src/config/database';
import { 
  createIndexes, 
  getDatabaseInfo, 
  validateDatabaseConnection,
  collectionExists 
} from '../src/utils/database';

// Define indexes for each collection based on the schema design
const COLLECTION_INDEXES = {
  students: [
    { fields: { studentId: 1 as const }, options: { unique: true, name: 'studentId_unique' } },
    { fields: { email: 1 as const }, options: { unique: true, name: 'email_unique' } },
    { fields: { 'academic.campusId': 1 as const, 'academic.programId': 1 as const }, options: { name: 'campus_program_idx' } },
    { fields: { 'academic.status': 1 as const, 'academic.currentPeriod': 1 as const }, options: { name: 'status_period_idx' } },
  ],
  schedules: [
    { fields: { studentId: 1 as const, periodId: 1 as const }, options: { unique: true, name: 'student_period_unique' } },
    { fields: { studentId: 1 as const }, options: { name: 'studentId_idx' } },
    { fields: { periodId: 1 as const }, options: { name: 'periodId_idx' } },
    { fields: { 'classes.courseNrc': 1 as const }, options: { name: 'courseNrc_idx' } },
  ],
  announcements: [
    { fields: { publishDate: -1 as const }, options: { name: 'publishDate_desc' } },
    { fields: { status: 1 as const, publishDate: -1 as const }, options: { name: 'status_publishDate_idx' } },
    { fields: { targetAudience: 1 as const, status: 1 as const }, options: { name: 'audience_status_idx' } },
    { fields: { expiryDate: 1 as const }, options: { name: 'expiryDate_idx' } },
  ],
  grades: [
    { fields: { studentId: 1 as const, periodId: 1 as const }, options: { name: 'student_period_idx' } },
    { fields: { studentId: 1 as const, courseNrc: 1 as const }, options: { unique: true, name: 'student_course_unique' } },
    { fields: { periodId: 1 as const }, options: { name: 'periodId_idx' } },
  ],
  campus: [
    { fields: { campusId: 1 as const }, options: { unique: true, name: 'campusId_unique' } },
    { fields: { name: 1 as const }, options: { name: 'name_idx' } },
  ],
  programs: [
    { fields: { programId: 1 as const }, options: { unique: true, name: 'programId_unique' } },
    { fields: { campusId: 1 as const, schoolId: 1 as const }, options: { name: 'campus_school_idx' } },
  ],
  courses: [
    { fields: { courseCode: 1 as const }, options: { name: 'courseCode_idx' } },
    { fields: { programId: 1 as const, semester: 1 as const }, options: { name: 'program_semester_idx' } },
  ],
  periods: [
    { fields: { periodId: 1 as const }, options: { unique: true, name: 'periodId_unique' } },
    { fields: { status: 1 as const, startDate: -1 as const }, options: { name: 'status_startDate_idx' } },
  ],
};

async function validateEnvironment(): Promise<void> {
  logger.info('🔍 Validating environment configuration...');
  
  if (!config.database.uri) {
    throw new Error('MONGODB_URI is required');
  }

  logger.info('✅ Environment validation passed');
}

async function initializeIndexes(): Promise<void> {
  logger.info('📊 Creating database indexes...');
  
  for (const [collectionName, indexes] of Object.entries(COLLECTION_INDEXES)) {
    try {
      logger.info(`📋 Processing indexes for collection: ${collectionName}`);
      await createIndexes(collectionName, indexes);
      logger.info(`✅ Indexes created for ${collectionName}`);
    } catch (error) {
      logger.error(`❌ Failed to create indexes for ${collectionName}:`, error);
      // Continue with other collections
    }
  }
  
  logger.info('✅ Database indexes initialization completed');
}

async function displayDatabaseInfo(): Promise<void> {
  try {
    logger.info('📊 Gathering database information...');
    
    const [dbInfo, healthCheck, connectionValidation] = await Promise.all([
      getDatabaseInfo(),
      checkDatabaseHealth(),
      validateDatabaseConnection(),
    ]);

    logger.info('📋 Database Information:', {
      name: dbInfo.name,
      version: dbInfo.version,
      size: `${(dbInfo.size / 1024 / 1024).toFixed(2)} MB`,
      collections: dbInfo.collections.length,
    });

    logger.info('🏥 Health Check:', healthCheck);
    logger.info('🔐 Connection Validation:', connectionValidation);

    // Display collection statistics
    for (const collectionName of dbInfo.collections) {
      if (COLLECTION_INDEXES[collectionName as keyof typeof COLLECTION_INDEXES]) {
        try {
          const exists = await collectionExists(collectionName);
          if (exists) {
            const collection = mongoose.connection.collection(collectionName);
            const indexes = await collection.listIndexes().toArray();
            logger.info(`📊 ${collectionName}: ${indexes.length} indexes`);
          }
        } catch (error) {
          logger.warn(`⚠️  Could not get stats for ${collectionName}:`, error);
        }
      }
    }
  } catch (error) {
    logger.error('❌ Failed to display database info:', error);
  }
}

async function initializeDatabase(): Promise<void> {
  try {
    logger.info('🚀 Starting database initialization...');
    
    // Validate environment
    await validateEnvironment();
    
    // Connect to database
    logger.info('🔄 Connecting to MongoDB...');
    await connectDB();
    logger.info('✅ Connected to MongoDB');

    // Validate connection and permissions
    const validation = await validateDatabaseConnection();
    if (!validation.connected || !validation.readable || !validation.writable) {
      throw new Error(`Database validation failed: ${JSON.stringify(validation)}`);
    }
    logger.info('✅ Database connection validated');

    // Initialize indexes
    await initializeIndexes();

    // Display database information
    await displayDatabaseInfo();

    logger.info('🎉 Database initialization completed successfully!');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    try {
      await disconnectDB();
      logger.info('🔌 Database connection closed');
    } catch (error) {
      logger.error('❌ Error closing database connection:', error);
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('📡 SIGINT received, shutting down...');
  try {
    await disconnectDB();
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('📡 SIGTERM received, shutting down...');
  try {
    await disconnectDB();
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
  }
  process.exit(0);
});

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };