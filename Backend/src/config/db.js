import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js to use Google & Cloudflare Public DNS for resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[DNS Config Warning]: Could not override DNS servers');
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error(
      '[Atlas Network Access Check]: If connection fails, please ensure your IP is allowed in MongoDB Atlas Network Access (or set to 0.0.0.0/0).'
    );
  }
};
