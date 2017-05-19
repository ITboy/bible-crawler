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

  async updateStatment(bible, isNew, name) {
    await this.connect();

    if (!bible) {
      throw new Error('Bible should be exist first!');
    }
    const updateTestatment = isNew ? { newTestament: { name } } : { oldTestament: { name } };
    await this.db.collection('bible').update(bible, { $set: updateTestatment });
  }

  async addScriptures(bible, isNew, bookName, chapterNo, sectionNo, text) {
    await this.connect();

    if (!bible) {
      throw new Error('Bible should be exist first!');
    }
    const testamentField = isNew ? newTestament : oldTestament;
    this.db.find({ name: bible.name, })
  }

  async close() {
    if (this.db) {
      await this.db.close();
    }
  }
}

module.exports = BibleDal;
/*
const test = async function () {
  const db = await MongoClient.connect('mongodb://localhost:27017/mydb');
  console.log('Connected correctly to server');

  // Insert a single document
  const r = await db.collection('bible').insertOne({
    name: '圣经和合本',
    language: 'Chinese',
    version: '和合本',
    origin: {
      main: 'http://www.o-bible.com/',
      resourceUrl: 'http://www.o-bible.com/gb/hgb.html',
    },
    newTestament: {
      name: '新约全书',
      books: [
        {
          name: '马太福音',
          testament: 'new',
          chapters: [
            [
              '亚伯拉 罕 的 后 裔 ， 大 卫 的 子 孙 ， 耶 稣 基 督 的 家 谱 。 （ 后 裔 子 孙 原 文 都 作 儿 子 下 同 ）',
              '亚 伯 拉 罕 生 以 撒 。 以 撒 生 雅 各 。 雅 各 生 犹 大 和 他 的 弟 兄',
            ],
          ],
        },
      ],
    },
  });
  assert.equal(1, r.insertedCount);

  // Close connection
  db.close();
};

test();
*/
