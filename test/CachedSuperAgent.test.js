const CachedSuperAgent = require('../CachedSuperAgent');
const assert = require('assert');

describe('CachedSuperAgent', function () {
  describe('get', function () {
    it('return http response the first time if network is ok', function (done) {
      const request = new CachedSuperAgent();
      request.get('http://www.baidu.com').then(({ res }) => {
        if (res.text && res.status === 200) {
          done();
        } else {
          done('res should have text and status');
        }
      });
    });

    it('throw exception if url is unavailable', function (done) {
        const request = new CachedSuperAgent();
        request.get('http://127.0.0.1:20').catch((error) => {
          assert.ok(error.message.includes('connect ECONNREFUSED'));
          done();
        });
    });

    it('retry n times if network is bad enough', function (done) {
      // In chinese network, google is timeout, what's more, timeout is set 10 ms.
      const request = new CachedSuperAgent('utf8', 10);
      request.get('http://www.google.com').catch((error) => {
        assert.ok(error.message.includes('Response timeout'));
        done();
      });
    });

    it('may retry some times if network is not good enough', function (done) {
      // In chinese network, google is timeout, what's more, timeout is set 500 ms.
      this.timeout(30000);
      const request = new CachedSuperAgent('gbk', 600);
      request.get('http://www.o-bible.com/gb/hgb.html')
      .then(({ res, retriedTimes }) => {
        console.log(`retried ${retriedTimes + 1} times`);
        done();
      })
      .catch((error) => {
        assert.ok(error.message.includes('Response timeout'));
        done();
      });
    });

    it.only('should in turns if request queue is full', function (done) {
      // In chinese network, google is timeout, what's more, timeout is set 500 ms.
      this.timeout(300000);
      const request = new CachedSuperAgent('gbk', 1000, 1000, 5, 10);
      const jobCount = 500;
      let resolveCount = 0;
      let rejectCount = 0;
      new Array(jobCount).fill(0).forEach(function () {
        //console.log(request.requestQueue.size);
        request.get('http://www.o-bible.com/gb/hgb.html')
        .then((res) => {
          resolveCount++;
          console.log(`finish ${resolveCount}`);
          if (resolveCount + rejectCount === jobCount) {
            done();
          }
        })
        .catch((error) => {
          rejectCount++;
          console.log(`${rejectCount} jobs reject, ${error}`);
          assert.ok(error.message.includes('Response timeout'));
          if (resolveCount + rejectCount === jobCount) {
            done();
          }
        });
      });
    });
  });
});
