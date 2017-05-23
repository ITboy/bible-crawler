const BibleDal = require('./BibleDal');
const cheerio = require('cheerio');
const CachedSuperAgent = require('./CachedSuperAgent');

const BibleDao = new BibleDal('mongodb://localhost:27017/mydb');

const mainUrl = 'http://www.o-bible.com/';
const indexUrl = 'http://www.o-bible.com/gb/hgb.html';

const NEW_TESTAMENT_NAME = '新约全书';
const OLD_TESTAMENT_NAME = '旧约全书';

const request = new CachedSuperAgent('gbk');

const innerTrim = function innerTrim(originText) {
  const split = String.prototype.split;
  return split.call(originText, /\s*/).join('');
};

const getTestamentName = function getTestamentName(originName) {
  const testamentNameLen = OLD_TESTAMENT_NAME.length;
  return Array.from(innerTrim(originName)).slice(0, testamentNameLen).join('');
};

(async function main() {
  const { res } = await request.get(indexUrl);
  const $ = cheerio.load(res.text);

  const testaments = $('div.tm.cn').map((i, element) => {
    const $this = $(element);
    const testamentName = getTestamentName($this.find('div.tt').text());
    const isNew = testamentName === NEW_TESTAMENT_NAME;
    const books = $this.find('a').map((j, anchorElem) => ({
      name: $(anchorElem).text(),
      url: $(anchorElem).attr('href'),
    })).get();
    return { testamentName, isNew, books };
  }).get();

  const bible = await BibleDao.createBible(
    '圣经和合本',
    '和合本',
    '简体中文',
    {
      main: mainUrl,
      index: indexUrl,
    });

  const updateTestatmentPromises = testaments.map(
    ({ isNew, testamentName }) =>
    BibleDao.updateTestatment(bible, isNew, testamentName));

  await updateTestatmentPromises;

  //await BibleDao.addScriptures(bible, false, '创世纪', 1, 1, '起初神创造天地');
  BibleDao.close();
}());
