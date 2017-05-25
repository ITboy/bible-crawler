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

  /**
   * check if the requestQueue is full
   * @param url the url for request
   * @return false if requestQueue is full
   */
  canRequest() {
    return this.requestQueue.size < this.requestQueueSize;
  }

  /**
   * shift the promise in turn in waitQueue, and resume them
   */
  resume() {
    // 处理等待队列的请求
    while (this.canRequest()
          && this.waitQueue.length > 0) {
      const { url, resolve, reject } = this.waitQueue.shift();
      this.get(url).then(resolve).catch(reject);
    }
  }

  /**
   * finish a get request
   * @return return a promise
   */
  get(url) {
    if (this.canRequest()) {
      const requestPromise = request.get(url)
        .charset(this.charset)
        .timeout({ response: this.timeout, deadline: this.deadline })
        .retry(this.maxRetriedTimes)
        .then((res) => {
          console.log('in then');
          this.requestQueue.delete(requestPromise);
          this.resume();
          return res;
        })
        .catch((error) => {
          console.log(error);

          this.requestQueue.delete(requestPromise);
          this.resume();
          return Promise.reject(error);
        });
      this.requestQueue.add(requestPromise);
      return requestPromise;
    }
    const waitPromise = { url };
    this.waitQueue.push(waitPromise);
    return new Promise((resolve, reject) => {
      Object.assign(waitPromise, { resolve, reject });
    });
  }
}

// export the class
module.exports = CachedSuperAgent;
