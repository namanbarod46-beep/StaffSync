const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, local ISP DNS often fails to resolve MongoDB SRV records.
// Setting public DNS (Google & Cloudflare) ensures reliable Atlas connection.
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync_db';
    console.log('[StaffSync] Connecting to MongoDB Atlas...');

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[StaffSync] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n======================================================`);
    console.error(`[StaffSync Database Connection Error]:`);
    console.error(`Message: ${error.message}`);
    console.error(`\nHOW TO FIX:`);
    console.error(`1. Go to your MongoDB Atlas dashboard -> "Network Access"`);
    console.error(`2. Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0)`);
    console.error(`3. Click "Confirm" and wait 1 minute for it to activate.`);
    console.error(`======================================================\n`);
  }
};

module.exports = connectDB;
