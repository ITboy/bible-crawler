const CachedSuperAgent = require('./CachedSuperAgent');
const Crawler = require('./Crawler');
const cheerio = require('cheerio');

const request = new CachedSuperAgent('GBK');

const mainUrl = 'http://www.o-bible.com/';
const indexUrl = 'http://www.o-bible.com/gb/hgb.html';

const NEW_TESTAMENT_NAME = '新约全书';
const OLD_TESTAMENT_NAME = '旧约全书';

const innerTrim = function innerTrim(originText) {
  const split = String.prototype.split;
  return split.call(originText, /\s*/).join('');
};

const getTestamentName = function getTestamentName(originName) {
  const testamentNameLen = OLD_TESTAMENT_NAME.length;
  return Array.from(innerTrim(originName)).slice(0, testamentNameLen).join('');
};

class CrawlerHehe extends Crawler {
  constructor() {
    super(request);
  }

  parseBible() {
    const name = '圣经和合本';
    const language = '简体中文';
    const version = '和合本';
    const index = indexUrl;
    const host = mainUrl;
    const newTestamentUrl = indexUrl;
    const oldTestamentUrl = indexUrl;

    return { name, language, version, index, host, newTestamentUrl, oldTestamentUrl };
  }

  parseTestament(res, isNew) {
    const $ = cheerio.load(res.text);
    const testament = {};
    $('div.tm.cn').each((i, element) => {
      const $this = $(element);
      const testamentName = getTestamentName($this.find('div.tt').text());
      console.log('in parseTestament aaa');
      if (isNew === (testamentName === NEW_TESTAMENT_NAME)) {
        const books = $this.find('a').map((j, anchorElem) => ({
          bookName: $(anchorElem).text(),
          bookUrl: $(anchorElem).attr('href'),
        })).get();
        console.log('in parseTestament ccc');
        Object.assign(testament, { testamentName, isNew, books });
      }
    });
    return testament;
  }
}

const crawler = new CrawlerHehe();

crawler.on('bible', function(bible) {
  console.log('-----------');
  console.dir(bible, {depth: 4});
});

crawler.on('testament', function(testament) {
  console.log('-----------');
  console.dir(testament, {depth: 4});
});

crawler.crawlBible(indexUrl);
