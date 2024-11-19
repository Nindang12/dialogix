import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DB_NAME = 'dialogix';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  try {
    if (cachedClient) {
      console.log('Using cached database connection');
      return cachedClient;
    }

    console.log('Creating new database connection to:', MONGODB_URI);
    const client = await MongoClient.connect(MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    const db = client.db(DB_NAME);
    await db.command({ ping: 1 });
    console.log('Successfully connected to MongoDB.');
    
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
} 