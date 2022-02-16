const { MongoClient } = require('mongodb');

module.exports = {
  dbName: 'mongo',
  collectionName: 'images',

  /**
   * 최초 한 번만 데이터베이스를 연결한다.
   */
  async connect() {
    if (this.client) return;

    try {
      const url = `mongodb+srv://woochul:${process.env.MONGO_ATLAS_PASSWORD}@alexander-photos.8t9wl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
      this.client = new MongoClient(url);
      await this.client.connect();
      console.log('Database is connected.');
    } catch (err) {
      throw new Error(err);
    }
  },

  /**
   * 모든 이미지 정보 배열을 가져온다.
   * 가장 최근에 추가한 이미지가 0번 인덱스에 오도록 정렬한다.
   *
   * @returns {Promise<MyImage[]>}
   */
  async readImages() {
    try {
      const database = this.client.db(this.dbName);
      const collection = database.collection(this.collectionName);
      return await collection.find({}).sort({ _id: -1 }).toArray();
    } catch (err) {
      throw new Error(err);
    }
  },

  /**
   * 쿼리를 만족하는 이미지 정보 하나를 가져온다.
   *
   * @param {MyImage} query
   * @returns {Promise<MyImage>}
   */
  async readImage(query) {
    try {
      const database = this.client.db(this.dbName);
      const collection = database.collection(this.collectionName);
      return await collection.findOne(query);
    } catch (err) {
      throw new Error(err);
    }
  },

  /**
   * 이미지 정보를 하나 추가한다.
   *
   * @param {MyImage} image
   */
  async addImage(image) {
    try {
      const database = this.client.db(this.dbName);
      const collection = database.collection(this.collectionName);
      await collection.insertOne(image);
    } catch (err) {
      throw new Error(err);
    }
  },

  /**
   * 쿼리를 만족하는 이미지 정보 하나를 삭제한다.
   *
   * @param {MyImage} query
   */
  async deleteImage(query) {
    try {
      const database = this.client.db(this.dbName);
      const collection = database.collection(this.collectionName);
      await collection.deleteOne(query);
    } catch (err) {
      throw new Error(err);
    }
  },

  /**
   * 필터를 만족하는 이미지 정보 하나를 수정한다.
   *
   * @param {MyImage} filter
   * @param {Object} update update operation: https://docs.mongodb.com/manual/reference/method/db.collection.updateOne/#std-label-update-one-update
   */
  async updateImage(filter, update) {
    try {
      const database = this.client.db(this.dbName);
      const collection = database.collection(this.collectionName);
      await collection.updateOne(filter, update);
    } catch (err) {
      throw new Error(err);
    }
  },
};
