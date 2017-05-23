const request = require('superagent');
require('superagent-charset')(request);

class CachedSuperAgent {
  constructor(charset = 'utf8', timeout = 5000, deadline = 10000, maxRetriedTimes = 5, maxRequestCount = 50) {
    this.charset = charset;
    this.timeout = timeout;
    this.deadline = deadline;
    this.maxRetriedTimes = maxRetriedTimes;
    this.requestQueueSize = maxRequestCount;
    this.requestQueue = new Set();
    this.waitQueue = [];
  }
  get(url, retriedTimes = 0) {
    console.log('retried ' + retriedTimes + ' -- begin');
    if (this.requestQueue.size < this.requestQueueSize) {
      const requestPromise = request.get(url)
        .charset(this.charset)
        .timeout({ response: this.timeout, deadline: this.deadline })
        .then((res) => {
          console.log('in then');
          this.requestQueue.delete(requestPromise);
          // 处理等待队列的请求
          while (this.requestQueue.size < this.requestQueueSize
                && this.waitQueue.length > 0) {
            //console.log('queueSize: ' + this.requestQueue.size + ' waitQueueSize: ' + this.waitQueue.length);
            const { url, retriedTimes, resolve, reject } = this.waitQueue.shift();
            this.get(url, retriedTimes).then(resolve).catch(reject);
            //console.log('queueSize: ' + this.requestQueue.size + ' waitQueueSize: ' + this.waitQueue.length);
          }
          return { res, retriedTimes };
        })
        .catch((error) => {
          console.log('in catch: ' + error);
          this.requestQueue.delete(requestPromise);
          console.log((error.message.includes('timeout') || error.message.includes('Timeout')) && retriedTimes < this.maxRetriedTimes);
          // 超时请求可能存在死连接，放在后面处理
          if ((error.message.includes('timeout') || error.message.includes('Timeout')) && retriedTimes < this.maxRetriedTimes) {
            console.log('retried ' + retriedTimes);
            return this.get(url, retriedTimes + 1);
          }

          // 处理等待队列的请求
          while (this.requestQueue.size < this.requestQueueSize
                && this.waitQueue.length > 0) {
            const { url, retriedTimes, resolve, reject } = this.waitQueue.shift();
            this.get(url, retriedTimes).then(resolve, reject);
          }
          throw error;
          console.log('return reject');
        });
      this.requestQueue.add(requestPromise);
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
