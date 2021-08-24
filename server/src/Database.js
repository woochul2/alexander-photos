import { MongoClient } from 'mongodb';

export default (function () {
  class Database {
    constructor() {
      if (Database.instance) return Database.instance;
      Database.instance = this;

      this.client;
    }

    async connect() {
      if (this.client) return;
      try {
        this.client = new MongoClient(
          `mongodb+srv://woochul:${process.env.MONGO_ATLAS_PASSWORD}@alexander-photos.8t9wl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
        );
        await this.client.connect();
      } catch (err) {
        console.error(err);
      }
    }

    async find(collectionName) {
      try {
        const database = this.client.db('mongo');
        const collection = database.collection(collectionName);
        return await collection.find({}).toArray();
      } catch (err) {
        console.error(err);
      }
    }

    async findOne(collectionName, query = {}) {
      try {
        const database = this.client.db('mongo');
        const collection = database.collection(collectionName);
        return await collection.findOne(query);
      } catch (err) {
        console.error(err);
      }
    }

    async insertOne(collectionName, data) {
      try {
        const database = this.client.db('mongo');
        const collection = database.collection(collectionName);
        await collection.insertOne(data);
      } catch (err) {
        console.error(err);
      }
    }
  }

  return new Database();
})();
