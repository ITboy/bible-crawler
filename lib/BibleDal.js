function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('babel-polyfill');

const { MongoClient } = require('mongodb');

class BibleDal {
  constructor(mongoUrl) {
    this.mongoUrl = mongoUrl;
  }
  connect() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!_this.db) {
        _this.db = yield MongoClient.connect(_this.mongoUrl);
      }
    })();
  }

  createBible(name, version, language, origin) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.connect();

      const recordCount = yield _this2.db.collection('bible').find({ name }).count();
      if (recordCount === 0) {
        yield _this2.db.collection('bible').insertOne({
          name,
          version,
          language,
          origin
        });
      }

      return { name, version, language, origin };
    })();
  }

  updateTestatment(bible, isNew, name) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.connect();

      if (!bible) {
        throw new Error('Bible should be exist first!');
      }
      const testatmentName = isNew ? { newTestament: { name } } : { oldTestament: { name } };
      yield _this3.db.collection('bible').update(bible, { $set: testatmentName });
    })();
  }

  addScriptures(bible, isNew, bookName, chapterNo, sectionNo, text) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.connect();

      if (!bible) {
        throw new Error('Bible should be exist first!');
      }
      const testamentField = isNew ? 'newTestament' : 'oldTestament';
      _this4.db.collection('bible').update({ name: bible.name }, { $set: { [`${testamentField}.${bookName}.${chapterNo}.${sectionNo}`]: text } });
    })();
  }

  close() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (_this5.db) {
        yield _this5.db.close();
      }
    })();
  }
}

module.exports = BibleDal;