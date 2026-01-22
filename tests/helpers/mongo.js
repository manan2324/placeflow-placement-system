const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let mongo;

async function resetMongooseConnection() {
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }

  // reset the cached connection used by src/lib/mongodb.js
  // (it stores cache in global.mongoose)
  global.mongoose = { conn: null, promise: null };
}

async function startInMemoryMongo() {
  mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  process.env.MONGODB_URI = mongo.getUri();
}

async function stopInMemoryMongo() {
  await resetMongooseConnection();
  if (mongo) {
    await mongo.stop();
    mongo = undefined;
  }
}

async function clearDatabase() {
  const conn = mongoose.connection;
  if (!conn?.db) return;

  const collections = await conn.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

module.exports = {
  startInMemoryMongo,
  stopInMemoryMongo,
  clearDatabase,
  resetMongooseConnection,
};
