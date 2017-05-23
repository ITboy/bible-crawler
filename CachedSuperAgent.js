const request = require('superagent');
require('superagent-charset')(request);

class CachedSuperAgent {
  constructor(charset = 'utf8', timeout = 5000, deadline = 10000, maxRetriedTimes = 5, maxRequestCount = 50) {
    this.charset = charset;
    this.timeout = timeout;
    this.deadline = deadline;
    this.maxRetriedTimes = maxRetriedTimes;
    this.requestQueueSize = maxRequestCount;
    this.requestQueue = new Set([]);
    this.waitQueue = [];
  }
  get(url, retriedTimes = 0) {
    if (this.requestQueue.size < this.requestQueueSize) {
      const requestPromise = request.get(url)
        .charset(this.charset)
        .timeout({ response: this.timeout, deadline: this.deadline })
        .then((error, res) => {
          this.requestQueue.remove(requestPromise);

          // 优先处理等待队列的请求
          do {
            const { url, retriedTimes, resolve, reject } = this.waitQueue.unshift();
            this.get(url, retriedTimes).then(resolve, reject);
          } while (this.requestQueue.size < this.requestQueueSize
            && this.waitQueue.length > 0);

          // 超时请求可能存在死连接，放在后面处理
          if (error === 'timeout' && retriedTimes < this.maxRetriedTimes) {
            return this.get(url, retriedTimes + 1);
          } else if (error) {
            return Promise.reject(error);
          }
          return Promise.resolve(res);
        });
      this.queue.add(requestPromise);
      return requestPromise;
    }
    const waitPromise = { url, retriedTimes };
    this.waitQueue.push(waitPromise);
    return new Promise((resolve, reject) => {
      Object.assign(waitPromise, { resolve, reject });
    });
  }
}

module.exports = CachedSuperAgent;
