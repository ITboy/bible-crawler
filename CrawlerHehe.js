const CachedSuperAgent = require('./CachedSuperAgent');
const Crawler = require('./Crawler');
const cheerio = require('cheerio');
const URL = require('url');

const request = new CachedSuperAgent('GBK');

const indexUrl = 'http://www.o-bible.com/gb/hgb.html';

const NEW_TESTAMENT_NAME = '新约全书';
const OLD_TESTAMENT_NAME = '旧约全书';

/**
 * 过滤字符串中间的空白字符
 * '旧 约 全 书' -> '旧约全书'
 */
const innerTrim = function innerTrim(originText) {
  const split = String.prototype.split;
  return split.call(originText, /\s*/).join('');
};

/*
 * 根据字符串,得到其中的'新约全书'或'旧约全书'
 */
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
    const rootUrl = URL.resolve(indexUrl, '/');
    const newTestamentUrl = indexUrl;
    const oldTestamentUrl = indexUrl;

    return { name, language, version, indexUrl, rootUrl, newTestamentUrl, oldTestamentUrl };
  }

  /*
   * 解析response，得到其中跟testament相关的数据
   * {
   *    testamentName: '新约全书',
   *    isNew: true,
   *    books: [{ name: '马太福音', url: 'http://xxxxx'},
   *            { name: '马太福音', url: 'http://xxxxx },],
   * }
   */
  parseTestament(res, bible, isNew) {
    const $ = cheerio.load(res.text);
    const testament = { bible };
    const { rootUrl } = bible;
    $('div.tm.cn').each((i, element) => {
      const $this = $(element);
      const testamentName = getTestamentName($this.find('div.tt').text());
      if (isNew === (testamentName === NEW_TESTAMENT_NAME)) {
        const books = $this.find('a').map((j, anchorElem) => ({
          bookName: innerTrim($(anchorElem).text()),
          bookUrl: URL.resolve(rootUrl, $(anchorElem).attr('href')),
          testament,
        })).get();
        Object.assign(testament, { testamentName, isNew, books });
      }
    });
    return testament;
  }

  parseBook(res, book) {
    const rootUrl = book.testament.bible.rootUrl;
    const $ = cheerio.load(res.text);
    const chapters = [];
    const $currentChapter = $('#topLink td.cl span');
    chapters.push({ chapterNo: $currentChapter.text(), chapterUrl: book.bookUrl, book });

    $('#topLink td.cl a').each((index, element) => {
      chapters.push({
        chapterNo: $(element).text(),
        chapterUrl: URL.resolve(rootUrl, $(element).attr('href')),
        book,
      });
    });
    const chapterNos = [].keys.call(chapters);
    const chapterCount = Math.max(...chapterNos);
    return { chapterCount, chapters };
  }

  parseChapter(res, chapter) {
    const $ = cheerio.load(res.text);
    const $sections = $('div#content tr').map((index, element) => {
      const chapterSection = $(element).find('td.vn').first().text();
      const sectionNo = chapterSection.split(':')[1];
      const sectionText = $(element).find('td.v.gb').text();
      return { sectionNo, sectionText };
    });
    return $sections.get();
  }
}
module.exports = CrawlerHehe;
