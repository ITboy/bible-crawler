const BibleDal = require('./BibleDal');
const cheerio = require('cheerio');
const request = require('superagent');
require('superagent-charset')(request);

const BibleDao = new BibleDal('mongodb://localhost:27017/mydb');

const mainUrl = 'http://www.o-bible.com/';
const indexUrl = 'http://www.o-bible.com/gb/hgb.html';

(async function main() {

  const res = await request.get(indexUrl).charset('gbk').timeout({
    response: 5000,  // Wait 5 seconds for the server to start sending,
    deadline: 60000, // but allow 1 minute for the file to finish loading.
  });

  const $ = cheerio.load(res.text);
  $('.tm_cn').map((element) => {
    const $this = $(element);
    console.log($this('tt').text());
  });
  /*
  const bible = await BibleDao.createBible(
    '圣经和合本',
    '和合本',
    '简体中文',
    {
      main: 'http://www.o-bible.com/',
      resourceUrl: 'http://www.o-bible.com/gb/hgb.html',
    });

  await BibleDao.updateStatment(bible, true, '新约圣经');
  await BibleDao.updateStatment(bible, false, '旧约圣经');

  await BibleDao.addScriptures(bible, false, '创世纪', 1, 1, '起初神创造天地');
  BibleDao.close();

    */
}());
// request
//    .get(indexUrl)
//    .end(function(err, res){
//      console.log(res.text);
//    });
