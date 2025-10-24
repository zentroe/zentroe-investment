import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    // If already connected, return early
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI exists:', !!process.env.MONGO_URI);

    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Connection options with better timeout handling
    const options = {
      serverSelectionTimeoutMS: 10000, // Reduce from 30s to 10s for faster failure
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 10000, // Connection timeout reduced to 10s
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain minimum 2 connections
      retryWrites: true,
      retryReads: true
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Handle connection events for monitoring
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err: any) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB');
    });

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error: any) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);

    // Provide helpful troubleshooting information
    if (error.message.includes('timed out')) {
      console.error('\n🔍 Troubleshooting tips:');
      console.error('1. Check if MongoDB Atlas IP whitelist includes your current IP');
      console.error('2. Verify MONGO_URI is correct in .env file');
      console.error('3. Check if MongoDB cluster is running');
      console.error('4. Verify network/firewall allows MongoDB connections (port 27017)');
      console.error('5. Try connecting from MongoDB Compass to test connection\n');
    }

    process.exit(1);
  }
};
