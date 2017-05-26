const assert = require('assert');
const CrawlerHehe = require('../CrawlerHehe');
const CachedSuperAgent = require('../CachedSuperAgent');

const request = new CachedSuperAgent('gbk', 10000, 20000, 10);

describe ('crawler-hehe', function () {
  describe('parseBook', function () {
    const crawler = new CrawlerHehe();
    it('If current chapter is the 1st chapter', function (done){
      this.timeout(100000);
      request.get('http://www.o-bible.com/cgibin/ob.cgi?version=hgb&book=gen&chapter=1')
      .then((res) => {
        const book = crawler.parseBook(res, '创世纪');
        try {
          assert.deepStrictEqual(book, { name: '创世纪', chapterCount: 50 });
        } catch (error) {
          done(error);
          return;
        }
        done();
      });
    });

    it('If current chapter is the lastChapter', function (done){
      this.timeout(100000);
      request.get('http://www.o-bible.com/cgibin/ob.cgi?version=hgb&book=gen&chapter=50')
      .then((res) => {
        const book = crawler.parseBook(res, '创世纪');
        try {
          assert.deepStrictEqual(book, { name: '创世纪', chapterCount: 50 });
        } catch (error) {
          done(error);
          return;
        }
        done();
      });
    });

    it('If current chapter is neither the 1st chapter nor the lastChapter', function (done){
      this.timeout(100000);
      request.get('http://www.o-bible.com/cgibin/ob.cgi?version=hgb&book=gen&chapter=30')
      .then((res) => {
        const book = crawler.parseBook(res, '创世纪');
        try {
          assert.deepStrictEqual(book, { name: '创世纪', chapterCount: 50 });
        } catch (error) {
          done(error);
          return;
        }
        done();
      });
    });

  });
});
