const { MongoClient } = require('mongodb');
const assert = require('assert');

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
