/**
 * Client MongoDB pour NextAuth (MongoDBAdapter)
 * Utilise le package 'mongodb' natif (pas Mongoose)
 */

import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Ajouter MONGODB_URI dans .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // En dev, utiliser une variable globale pour éviter de recréer des connexions
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En production, créer une nouvelle connexion
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
