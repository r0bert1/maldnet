import { MongoClient } from 'mongodb';

interface Bid {
	userId: string,
	amount: number,
	itemId: string,
	timestamp: Date,
	buyTime: Date
}

// Connection URL
const url = 'mongodb://127.0.0.1:27017';
const client: MongoClient = new MongoClient(url);

// Database Name
const dbName = 'maldnet';

async function finalizeBid(bid: Bid) {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('items');

  const updateItem = await collection.updateOne(
	{ _id: bid.itemId },
	{ buyer: bid.userId, buyAmount: bid.amount, buyTime: bid.buyTime }
  );
  console.log('Updated item =>', updateItem);

  return 'done.';
}

async function insertItem(item: any) {
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

  return findItems;
}

async function insertUser(user: any) {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('users');

  const addUser = await collection.insertOne(user);
  console.log('Inserted user =>', addUser);

  return 'done.';
}

async function getUser(user: string) {
  await client.connect()
  const db = client.db(dbName)
  const collection = db.collection('users')

  const findUser = await collection.find({ username: user }).toArray()
  return findUser
}

async function getAllUsers() {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('users');

  const findUsers = await collection.find({}).toArray();

  return findUsers;
}

export { insertItem, getAllItems, insertUser, getAllUsers, getUser, finalizeBid }