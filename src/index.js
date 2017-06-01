require('babel-polyfill');

const BibleDal = require('./BibleDal');
const crawlerHehe = require('./CrawlerHehe')();

const BibleDao = new BibleDal('mongodb://localhost:27017/mydb');

crawlerHehe.on('bible', (bible) => {
  console.log('---------- bible event --------');
  console.log(bible);
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
