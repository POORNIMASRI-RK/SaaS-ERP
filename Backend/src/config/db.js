import mongoose from 'mongoose';
import dns from 'dns';

// Safely set DNS servers only if allowed (won't crash Render cloud containers)
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore DNS override warning in cloud environments
  }
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ [MONGODB_URI Warning]: MONGODB_URI is not set in Environment Variables!');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    console.error(
      '👉 [Atlas Network Access Check]: Please ensure 0.0.0.0/0 (allow all IPs) is added to MongoDB Atlas Network Access.'
    );
  }
};
