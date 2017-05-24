const BibleDal = require('./BibleDal');
const cheerio = require('cheerio');
const CachedSuperAgent = require('./CachedSuperAgent');
const URL = require('url');

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

const fetchChapters = async function fetchChapters(bookUrl) {
  const { res } = await request.get(URL.resolve(mainUrl, bookUrl));
  const $ = cheerio.load(res.text);
  return $('div#topLink td.cl a').map((index, element) => {
    return {
      chapterNo: $(element).text(),
      chapterUrl: $(element).attr('href'),
    };
  }).get();
};

const fetchSections = async function fetchSections(chapterUrl) {
  const { res } = await request.get(URL.resolve(mainUrl, chapterUrl));
  const $ = cheerio.load(res.text);
  return $('#content td.v.gb').map((index, element) => {
    console.log({
      sectionNo: index + 1,
      text: $(element).text(),
    });
    return {
      sectionNo: index + 1,
      text: $(element).text(),
    };
  }).get();
};

(async function main() {
  const { res } = await request.get(indexUrl);
  const $ = cheerio.load(res.text);

  const testaments = $('div.tm.cn').map((i, element) => {
    const $this = $(element);
    const testamentName = getTestamentName($this.find('div.tt').text());
    const isNew = testamentName === NEW_TESTAMENT_NAME;
    const books = $this.find('a').map((j, anchorElem) => ({
      bookName: $(anchorElem).text(),
      bookUrl: $(anchorElem).attr('href'),
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
  const testamentPromises = testaments.map(function ({ isNew, books }) {
    const bookPromises = books.map(function ({ bookName, bookUrl }) {
      return fetchChapters(bookUrl).then(chapters => {
        const chapterPromises = chapters.map(({ chapterNo, chapterUrl }) => {
          return fetchSections(chapterUrl).then((sections) => {
            sections.forEach(({ isNew, sectionNo, text }) => {
              BibleDao.addScriptures(bible, isNew, bookName, chapterNo, sectionNo, text);
            });
          });
        });
        return Promise.all(chapterPromises);
      });
    });
    return Promise.all(bookPromises);
  });
  await Promise.all(testamentPromises);
  console.log('-------------------------- finish ---------------------');
  /*
  const chapters = await fetchChapters(testaments[0].books[1].url);
  console.log(chapters);
  const sections = await fetchSections(chapters[0]);
  console.log(sections);
  //await BibleDao.addScriptures(bible, false, '创世纪', 1, 1, '起初神创造天地');
  */
  BibleDao.close();
}());
