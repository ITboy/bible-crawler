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
              index,
              host,
              newTestamentUrl,
              oldTestamentUrl,
            } = this.parseBible(res);
      const bible = { name, language, version, index, host };
      this.emit('bible', bible);
      const testaments = [{ isNew: true, testamentUrl: newTestamentUrl, bible },
                          { isNew: false, testamentUrl: oldTestamentUrl, bible }];
      async.each(testaments, this.crawlTestament.bind(this), function (error) {
        if (error) {
          this.emit('error', error);
        } else {
          this.emit('bible-end', bible);
        }
      });
    });
  }

  crawlTestament({ testamentUrl, isNew, bible }, callback) {
    this.request.get(testamentUrl).then((res) => {
      console.log('in crawlTestament then');
      console.log(this.parseTestament(res, isNew));
      const { testamentName, books } = this.parseTestament(res, isNew);

      const booksCount = books.length;
      const testament = { name: testamentName, isNew, booksCount, bible };
      this.emit('testament', testament);
      console.log(('after emit testament'));
      async.each(books, ({ url }, callback) => this.crawlBook(url, testament, callback), function (error) {
        if (error) {
          callback(error);
        } else {
          this.emit('testament-end', testament);
          callback();
        }
      });
    });
  }

  crawlBook(url, testament, callback) {
    console.log('in crawlBook, ' + this);
    this.emit('book', {});
    callback();
  }

  crawlChapter(url, book) {

  }
}

module.exports = Crawler;
