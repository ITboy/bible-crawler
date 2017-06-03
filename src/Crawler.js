require('babel-polyfill');

const EventEmitter = require('events');
const async = require('async');

const level = {
  SECTION: Symbol('section'),
  CHAPTER: Symbol('chapter'),
  BOOK: Symbol('book'),
  TESTAMENT: Symbol('testament'),
  BIBLE: Symbol('bible'),
};

class Crawler extends EventEmitter {
  constructor(request) {
    super();
    this.request = request;
  }

  crawlBible(bible) {
    this.request.get(bible.indexUrl)
    .catch((error) => {
      const wrapError = ({ ...error, level: level.BIBLE, url: bible.indexUrl });
      throw wrapError;
    })
    .then((res) => {
      // crawl bible, get bible's meta data
      const bibleData = this.parseBible(res);
      const { newTestamentUrl, oldTestamentUrl } = bibleData;

      this.emit('bible', bible);

      // crawl testament
      const testaments = [
        { isNew: true, testamentUrl: newTestamentUrl, bible: bibleData },
        { isNew: false, testamentUrl: oldTestamentUrl, bible: bibleData },
      ];

      return new Promise((resolve, reject) =>
        async.each(testaments, (item, cb) => this.crawlTestament(item, cb), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(bibleData);
          }
        }));
    })
    .then((bibleData) => {
      this.emit('bible-end', bibleData);
    })
    .catch((error) => {
      this.emit('bible-end', bible, error);
    });
  }

  /**
   * crawl testament by param `testament`, and indicate result by `callback`
   *
   * @param {Object} testament testament info Object, properties as below:
   *  { isNew: true, testamentUrl: newTestamentUrl, bible }
   * @param {function} callback invoke callback while crawl finish.
   */

  crawlTestament(testament, callback) {
    this.request.get(testament.testamentUrl)
    .catch((error) => {
      const wrapError = ({ ...error, level: level.TESTAMENT, url: testament.testamentUrl });
      throw wrapError;
    })
    .then((res) => {
      const testamentData = this.parseTestament(res, testament);

      this.emit('testament', testamentData);

      return new Promise((resolve, reject) =>
        async.each(testamentData.books, (item, cb) => this.crawlBook(item, cb), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(testamentData);
          }
        }));
    })
    .then((testamentData) => {
      this.emit('testament-end', testamentData);
      callback();
    })
    .catch((error) => {
      this.emit('testament-end', testament, error);
      callback(error);
    });
  }

  crawlBook(book, callback) {
    this.request.get(book.bookUrl)
    .catch((error) => {
      const wrapError = ({ ...error, level: level.BOOK, url: book.bookUrl });
      throw wrapError;
    })
    .then((res) => {
      // parse book's meta data, such as chapterCount .etc
      const bookData = this.parseBook(res, book);

      // emit book event
      this.emit('book', bookData);

      // crawl chapters
      // Note: could not invoke `async.each`, otherwise there is no way to
      // notify error that happened in crawl chapter
      return new Promise((resolve, reject) =>
        async.each(bookData.chapters, (item, cb) => this.crawlChapter(item, cb), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(bookData);
          }
        }));
    })
    .then((bookData) => {
      this.emit('book-end', bookData);
      callback();
    })
    .catch((error) => {
      this.emit('book-end', book, error);
      callback(error);
    });
  }

  crawlChapter(chapter, callback) {
    this.request.get(chapter.chapterUrl)
    .catch((error) => {
      const wrapError = ({ ...error, level: level.CHAPTER, url: chapter.chapterUrl });
      throw wrapError;
    })
    .then((res) => {
      // parse chapter's meta data, such as sectionCount .etc
      const chapterData = this.parseChapter(res, chapter);

      // emit chapter event
      this.emit('chapter', chapterData);

      // crawl sections
      // Note: could not invoke `async.each`, otherwise there is no way to
      // notify error that happened in crawl section
      return new Promise((resolve, reject) =>
        async.each(chapterData.sections, (item, cb) => this.crawlSection(item, cb), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(chapterData);
          }
        }));
    })
    .then((chapterData) => {
      this.emit('chapter-end', chapterData);
      callback();
    })
    .catch((error) => {
      this.emit('chapter-end', error);
      callback(error);
    });
  }

  crawlSection(section, callback) {
    this.emit('section', section);
    this.emit('section-end', section);
    callback();
  }
}

module.exports = {
  Crawler,
  level,
};
