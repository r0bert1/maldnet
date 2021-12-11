const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'maldnet';

async function insertItem(item : any) {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('items');

  const addItem = await collection.insertOne(item);
  console.log('Inserted item =>', addItem);

  return 'done.';
}

async function getAllItems() {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('items');

  const findItems = await collection.find({}).toArray();
  console.log('Found documents =>', findItems);

  return findItems;
}

export { insertItem, getAllItems }