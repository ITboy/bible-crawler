const EventEmitter = require('events');
const async = require('async');

class Crawler extends EventEmitter {
  constructor(request) {
    super();
    this.request = request;
  }

  crawlBible(url) {
    this.request.get(url).then((res) => {
      const { name,
              language,
              version,
              indexUrl,
              rootUrl,
              newTestamentUrl,
              oldTestamentUrl,
            } = this.parseBible(res);
      const bible = { name, language, version, indexUrl, rootUrl };
      this.emit('bible', bible);
      const testaments = [{ isNew: true, testamentUrl: newTestamentUrl, bible },
                          { isNew: false, testamentUrl: oldTestamentUrl, bible }];
      async.each(testaments, this.crawlTestament.bind(this), (error) => {
        if (error) {
          this.emit('error', error);
        } else {
          this.emit('bible-end', bible);
        }
      });
    });
  }

  crawlTestament(testament, callback) {
    const { testamentUrl, isNew, bible } = testament;
    this.request.get(testamentUrl).then((res) => {
      const { testamentName, books } = this.parseTestament(res, bible, isNew);

      const booksCount = books.length;
      const testamentData = { name: testamentName, isNew, booksCount, bible };
      this.emit('testament', testamentData);

      async.each(books, this.crawlBook.bind(this), (error) => {
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
    const { bookUrl, bookName } = book;
    this.request.get(bookUrl).then((res) => {
      const { chapterCount, chapters } = this.parseBook(res, book);
      Object.assign(book, { chapterCount, chapters });
      const bookData = { name: bookName, chapterCount };
      this.emit('book', bookData);
      async.each(chapters, this.crawlChapter.bind(this), (error) => {
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
    const { chapterUrl } = chapter;
    this.request.get(chapterUrl).then((res) => {
      const sections = this.parseChapter(res, chapter);
      sections.forEach((section) => {
        this.emit('section', section);
      });
      this.emit('chapter-end', chapter);
    });
  }
}

module.exports = Crawler;
