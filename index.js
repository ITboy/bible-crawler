const BibleDal = require('./BibleDal');
const cheerio = require('cheerio');
const CrawlerHehe = require('./CrawlerHehe');

const BibleDao = new BibleDal('mongodb://localhost:27017/mydb');

const mainUrl = 'http://www.o-bible.com/';
const indexUrl = 'http://www.o-bible.com/gb/hgb.html';

const NEW_TESTAMENT_NAME = '新约全书';
const OLD_TESTAMENT_NAME = '旧约全书';

const crawler = new CrawlerHehe();

crawler.on('bible', function (bible) {
  const { name, language, version, rootUrl, indexUrl } = bible;

  BibleDao.createBible(
    name,
    version,
    language,
    {
      rootUrl,
      indexUrl,
    });
});

crawler.on('testament', function (testament) {
  const { bible, isNew, name } = testament;
  console.log('-----testament event------');
  console.dir(testament, {depth: 4});
  BibleDao.updateTestatment(bible, isNew, name);
});

crawler.on('book', function (book) {
  console.log('------------book event -----------');

  console.dir(book, {depth: 4});
});

crawler.on('chapter', function(chapter) {
  console.log('---chapter event----');
  console.log('chapter:' + chapter);
});

crawler.on('section', function(section) {
  console.log('---section event----');
  console.log(section);
});

crawler.on('book-end', function(book) {
  console.log('book-end:' + book.name);
});

crawler.on('testament-end', function(testament) {
  console.log('testament-end:' + testament.name);
});

crawler.on('bible-end', function(bible) {
  console.log('bible-end:' + bible.name);
});

crawler.crawlBible(indexUrl);
/*
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

  const chapters = await fetchChapters(testaments[0].books[1].url);
  console.log(chapters);
  const sections = await fetchSections(chapters[0]);
  console.log(sections);
  //await BibleDao.addScriptures(bible, false, '创世纪', 1, 1, '起初神创造天地');
  
  BibleDao.close();
};
*/
