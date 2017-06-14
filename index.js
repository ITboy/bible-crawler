require('babel-polyfill');

const crawlerHehe = require('./lib/CrawlerHehe')();
const BibleDal = require('./lib/BibleDal')('mongodb://localhost:27017/mydb');

let heheBible;
crawlerHehe.on('bible', (bible) => {
  console.log('---------- bible event --------');
  console.log(bible);

  const { name, version, language, indexUrl, rootUrl } = bible;
  BibleDal.createBible(
    name,
    version,
    language,
    { indexUrl, rootUrl }
  ).then((bibleModel) => {
    heheBible = bibleModel;
  });
});

crawlerHehe.on('testament', (testament) => {
  //const { bible, isNew, name } = testament;
  console.log('----- testament event ------');
  //console.dir(testament);
  BibleDal.updateTestatment(heheBible, testament.isNew, testament.name);
  //console.dir(testament, { depth: 4 });
  //BibleDao.updateTestatment(bible, isNew, name);
});

crawlerHehe.on('book', (book) => {
  console.log('------------ book event -----------');

  //console.dir(book, { depth: 4 });
});

crawlerHehe.on('chapter', (chapter) => {
  console.log('--- chapter event ----');
  console.log(`chapter: ${chapter}`);
});

crawlerHehe.on('section', (section) => {
  console.log('--- section event ----');
  console.log(`${section.sectionNo}:${section.sectionText}`);
  const chapter = section.chapter;
  const book = chapter.book;
  const testament = book.testament;
  BibleDal.addScriptures(
    heheBible,
    testament.isNew,
    book.name,
    chapter.chapterNo,
    section.sectionNo,
    section.sectionText
  )
});

crawlerHehe.on('book-end', (book) => {
  console.log(`book-end: ${book.name}`);
});

crawlerHehe.on('testament-end', (testament, error) => {
  console.log(`testament-end: ${testament.name}, ${error}`);
});

crawlerHehe.on('bible-end', (bible) => {
  console.log(`bible-end: ${bible.name}`);
});

crawlerHehe.on('error', function(error, callback) {
  console.log('---------- error found ----------');
  console.dir(error);
  callback && callback();
});

crawlerHehe.run();
