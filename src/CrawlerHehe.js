require('babel-polyfill');

const CachedSuperAgent = require('./CachedSuperAgent');
const { Crawler } = require('./Crawler');
const cheerio = require('cheerio');
const resolveUrl = require('url').resolve;

const request = new CachedSuperAgent('GBK', 15000, 20000);

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

    const name = '圣经和合本';
    const language = '简体中文';
    const version = '和合本';
    const rootUrl = resolveUrl(indexUrl, '/');

    this.bible = { name, language, version, rootUrl, indexUrl };
  }

  parseBible() {
    const newTestamentUrl = indexUrl;
    const oldTestamentUrl = indexUrl;

    return { ...this.bible, newTestamentUrl, oldTestamentUrl };
  }

  /**
   * 解析response，得到其中跟testament相关的数据
   * {
   *    testamentName: '新约全书',
   *    isNew: true,
   *    books: [{ name: '马太福音', url: 'http://xxxxx'},
   *            { name: '马太福音', url: 'http://xxxxx },],
   * }
   */
  parseTestament(res, testament) {
    const $ = cheerio.load(res.text);
    const { isNew, bible: { rootUrl } } = testament;
    const { testamentUrl, ...testamentData } = testament;
    let testamentName;

    const $testament = $('div.tm.cn').filter((i, element) => {
      const $this = $(element);
      const name = innerTrim(getTestamentName($this.find('div.tt').text()));

      const matched = (isNew && (name === NEW_TESTAMENT_NAME)) ||
                      (!isNew && (name === OLD_TESTAMENT_NAME));

      if (matched) testamentName = name;
      return matched;
    });

    if (!$testament && testamentName) throw new Error('No testament name matched');

    const books = $testament.find('a').map((i, anchorElem) => ({
      bookName: innerTrim($(anchorElem).text()),
      bookUrl: resolveUrl(rootUrl, $(anchorElem).attr('href')),
      testament: testamentData,
    })).get();
    const booksCount = books.length;
    return Object.assign(testamentData, { name: testamentName, books, booksCount });
  }

  parseBook(res, book) {
    const rootUrl = book.testament.bible.rootUrl;
    const $ = cheerio.load(res.text);
    const chapters = [];
    const { bookUrl, ...bookData } = book;

    // add current chapter
    const $currentChapter = $('#topLink td.cl span');
    chapters.push({ chapterNo: $currentChapter.text(), chapterUrl: bookUrl, bookData });

    // add other chapters
    $('#topLink td.cl a').each((index, element) => {
      chapters.push({
        chapterNo: $(element).text(),
        chapterUrl: resolveUrl(rootUrl, $(element).attr('href')),
        book: bookData,
      });
    });
    const chapterNos = [].keys.call(chapters);
    const chapterCount = Math.max(...chapterNos);
    return Object.assign(bookData, { chapterCount, chapters });
  }

  parseChapter(res, chapter) {
    const { chapterUrl, ...chapterData } = chapter;
    const $ = cheerio.load(res.text);
    const $sections = $('div#content tr').map((index, element) => {
      const chapterSection = $(element).find('td.vn').first().text();
      const sectionNo = chapterSection.split(':')[1];
      const sectionText = innerTrim($(element).find('td.v.gb').text());
      return { sectionNo, sectionText, chapter: chapterData };
    });
    const sections = $sections.get();
    const sectionCount = sections.length;
    return Object.assign(chapterData, { sections, sectionCount });
  }

  run() {
    return this.crawlBible(this.bible);
  }
}

const crawler = function crawler() {
  return new CrawlerHehe(request);
};

module.exports = crawler;
