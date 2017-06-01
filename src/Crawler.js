require('babel-polyfill');

const EventEmitter = require('events');
const async = require('async');

class Crawler extends EventEmitter {
  constructor(request) {
    super();
    this.request = request;
  }

  crawlBible(url) {
    this.request.get(url).then((res) => {
      // crawl bible, and emit bible event
      const bible = this.parseBible(res);
      const { newTestamentUrl, oldTestamentUrl, ...bibleData } = bible;
      this.emit('bible', bibleData);

      // crawl testament
      const testaments = [
        { isNew: true, testamentUrl: newTestamentUrl, bible },
        { isNew: false, testamentUrl: oldTestamentUrl, bible },
      ];
      async.each(testaments, (...args) => this.crawlTestament(args), (error) => {
        if (error) {
          this.emit('error', error);
        } else {
          this.emit('bible-end', bibleData);
        }
      });
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
    this.request.get(testament.testamentUrl).then((res) => {
      const testamentData = this.parseTestament(res, testament);
      this.emit('testament', testamentData);

      async.each(testamentData.books, (...args) => this.crawlBook(args), (error) => {
        if (error) {
          callback(error);
        } else {
          this.emit('testament-end', testamentData);
          callback();
        }
      });
    });
  }

  crawlBook(book, callback) {
    this.request.get(book.bookUrl).then((res) => {
      const bookData = this.parseBook(res, book);
      this.emit('book', bookData);

      async.each(bookData.chapters, (...args) => this.crawlChapter(args), (error) => {
        if (error) {
          callback(error);
        } else {
          this.emit('book-end', bookData);
          callback();
        }
      });
    }).catch((error) => {
      callback(error);
    });
  }

  crawlChapter(chapter, callback) {
    this.request.get(chapter.chapterUrl).then((res) => {
      const chapterData = this.parseChapter(res, chapter);
      this.emit('chapter', chapterData);

      async.each(chapterData.sections, (...args) => this.crawlSection(args), (error) => {
        if (error) {
          callback(error);
        } else {
          this.emit('chapter-end', chapterData);
          callback();
        }
      });
    });
  }

  crawlSection(section, callback) {
    this.emit('section', section);
    this.emit('section-end', section);
    callback();
  }
}

module.exports = Crawler;
