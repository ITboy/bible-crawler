const BibleDal = require('./BibleDal');

const BibleDao = new BibleDal('mongodb://localhost:27017/mydb');

(async function test() {
  const bible = await BibleDao.createBible('圣经和合本', '和合本', '简体中文', {});

  await BibleDao.updateStatment(bible, true, '新约圣经');
  await BibleDao.updateStatment(bible, false, '旧约圣经');

  BibleDao.close();
}());
