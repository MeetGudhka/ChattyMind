import mongoose from 'mongoose';
import 'dotenv/config';
import Message from './models/Message.js';

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for cleanup...');

    // 1. Delete messages that have null or undefined tempId (optional, but good for index)
    // const resultNull = await Message.deleteMany({ tempId: { $exists: false } });
    // console.log(`Deleted ${resultNull.deletedCount} messages without tempId`);

    // 2. Find and delete duplicates based on tempId
    const duplicates = await Message.aggregate([
      { $match: { tempId: { $ne: null } } },
      { $group: {
        _id: "$tempId",
        count: { $sum: 1 },
        docs: { $push: "$_id" }
      }},
      { $match: { count: { $gt: 1 } } }
    ]);

    console.log(`Found ${duplicates.length} sets of duplicates.`);

    for (const group of duplicates) {
      const [keep, ...remove] = group.docs;
      await Message.deleteMany({ _id: { $in: remove } });
      console.log(`Removed ${remove.length} duplicates for tempId: ${group._id}`);
    }

    // 3. Force create the unique index
    console.log('Creating unique index on tempId...');
    await Message.collection.createIndex({ tempId: 1 }, { unique: true, sparse: true });
    console.log('Unique index created successfully.');

    await mongoose.disconnect();
    console.log('Cleanup complete.');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
