import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    // If already connected, return early
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    console.log('Connecting to MongoDB...');

    const conn = await mongoose.connect(process.env.MONGO_URI!);

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
    process.exit(1);
  }
};
