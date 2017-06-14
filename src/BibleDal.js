require('babel-polyfill');

const { MongoClient } = require('mongodb');

class BibleDal {
  constructor(mongoUrl) {
    this.mongoUrl = mongoUrl;
  }
  async connect() {
    if (!this.db) {
      this.db = await MongoClient.connect(this.mongoUrl);
    }
  }

  async createBible(name, version, language, origin) {
    await this.connect();

    const recordCount = await this.db.collection('bible').find({ name }).count();
    if (recordCount === 0) {
      await this.db.collection('bible').insertOne({
        name,
        version,
        language,
        origin,
      });
    }

    return { name, version, language, origin };
  }

  async updateTestatment(bible, isNew, name) {
    await this.connect();

    if (!bible) {
      throw new Error('Bible should be exist first!');
    }
    const testatmentName = isNew ? { newTestament: { name } } : { oldTestament: { name } };
    await this.db.collection('bible')
                 .update(bible, { $set: testatmentName });
  }

  async addScriptures(bible, isNew, bookName, chapterNo, sectionNo, text) {
    await this.connect();

    if (!bible) {
      throw new Error('Bible should be exist first!');
    }
    const testamentField = isNew ? 'newTestament' : 'oldTestament';
    this.db.collection('bible').update(
      { name: bible.name },
      { $set: { [`${testamentField}.${bookName}.${chapterNo}.${sectionNo}`]: text } },
    );
  }

  async close() {
    if (this.db) {
      await this.db.close();
    }
  }
}

module.exports = function bibleDal(mongoUrl) {
  return new BibleDal(mongoUrl);
};
