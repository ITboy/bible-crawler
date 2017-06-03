require('babel-polyfill');

const BibleDal = require('./lib/BibleDal');
const crawlerHehe = require('./lib/CrawlerHehe')();

const BibleDao = new BibleDal('mongodb://localhost:27017/mydb');

crawlerHehe.on('bible', (bible, error) => {
  console.log(`[bible]: ${bible.name}`);
  if (error) console.log(error);
  //console.log(bible);
  /*
  const { name, language, version, rootUrl, indexUrl } = bible;

  BibleDao.createBible(
    name,
    version,
    language,
    {
      rootUrl,
      indexUrl,
    });
    */
});

crawlerHehe.on('testament', (testament) => {
  console.log(`[TESTAMENT]: ${testament.name}`);
});

crawlerHehe.on('book', (book) => {
  console.log(`[BOOK]: ${book.bookName}`);
});

crawlerHehe.on('chapter', (chapter) => {
  console.log(`[CHAPTER]: ${chapter.chapterNo}`);
  console.log('#################chapter:');
  console.dir(chapter, { depth: 5 });
});

crawlerHehe.on('section', (section) => {
  const chapter = section.chapter;
  console.log(`[SECTION]: ${chapter.chapterNo}:${section.sectionNo} ${section.sectionText}`);
});

crawlerHehe.on('book-end', (book, error) => {
  console.log(`[BOOK-END]: ${book.bookName}`);
  if (error) console.log(error);
});

crawlerHehe.on('testament-end', (testament, error) => {
  console.log(`[TESTAMENT-END]: ${testament.name}`);
  if (error) console.log(error);
});

crawlerHehe.on('bible-end', (bible, error) => {
  console.log(`[BIBLE-END]: ${bible.name}`);
  if (error) console.log(error);
});

crawlerHehe.run();
