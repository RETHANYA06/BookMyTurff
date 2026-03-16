const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dropEmailIndex = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookmyturf';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'players' }).toArray();
    
    if (collections.length > 0) {
      console.log('Checking indexes on collections: players');
      try {
        await db.collection('players').dropIndex('email_1');
        console.log('Successfully dropped email_1 index');
      } catch (err) {
        if (err.codeName === 'IndexNotFound' || err.message.includes('index not found')) {
          console.log('Index email_1 not found, skipping...');
        } else {
          throw err;
        }
      }
    } else {
      console.log('Collection players not found');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error dropping index:', error);
    process.exit(1);
  }
};

dropEmailIndex();
