require('babel-polyfill');

const crawlerHehe = require('./CrawlerHehe')();
const BibleDal = require('./BibleDal')('mongodb://localhost:27017/mydb');

let heheBible;
crawlerHehe.on('bible', (bible) => {
  console.log('---------- bible event --------');
  console.log(bible);
  const { name, version, language, indexUrl, rootUrl } = bible;
  BibleDal.createBible(
    name,
    version,
    language,
    indexUrl,
    { indexUrl, rootUrl },
  ).then((bibleModel) => {
    heheBible = bibleModel;
  });
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
  //const { bible, isNew, name } = testament;
  console.log('----- testament event ------');
  updateTestatment(heheBible, testament.isNew, testament.name);
  console.dir(testament, { depth: 4 });
  //BibleDao.updateTestatment(bible, isNew, name);
});

crawlerHehe.on('book', (book) => {
  console.log('------------ book event -----------');

  console.dir(book, { depth: 4 });
});

crawlerHehe.on('chapter', (chapter) => {
  console.log('--- chapter event ----');
  console.log(`chapter: ${chapter}`);
});

crawlerHehe.on('section', (section) => {
  console.log('--- section event ----');
  console.log(section);
  const chapter = section.chapter;
  const book = chapter.book;
  const testament = book.testament;
  BibleDal.addScriptures(
    heheBible,
    testament.isNew,
    book.name,
    chapter.chapterNo,
    section.sectionNo,
    section.text
  )
});

crawlerHehe.on('book-end', (book) => {
  console.log(`book-end: ${book.name}`);
});

crawlerHehe.on('testament-end', (testament) => {
  console.log(`testament-end: ${testament.name}`);
});

crawlerHehe.on('bible-end', (bible) => {
  console.log(`bible-end: ${bible.name}`);
});

crawlerHehe.run();
