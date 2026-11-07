import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_CONN as string);

export const getMongo = async (): Promise<MongoClient> => {
    await mongoClient.connect();
    return mongoClient;
};
