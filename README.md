# 多个圣经网站的爬虫程序
  作为一个很小的，拿来练手的项目，力争把代码质量做到在自己范围内最好。
  练手目标：
  1. mongodb，思考如何设计表结构有利于下一步的圣经查询，练习mongodb的基本操作
  2. nodejs，严格遵守eslint-config-airbnb的规范，除module外，严格使用es6的语法
  3. async， 尝试多种异步来解决问题，包括generate函数，async等
  4. io 并发控制，可以调整参数控制最大io并发数
  5. 练习markdown写作
  6. 单元测试
## 设计
### 表结构设计
DB name: Mydb
Collection: bible
Schema:
``` json
{
  "language": "Chinese",
  "version": "和合本",
  "origin": {
    "host": "http://www.o-bible.com/",
    "index": "http://www.o-bible.com/gb/hgb.html",
    },
  "newTestament": {
    "name": "新约全书",
    "马太福音": {
      "1": {
        "1": "xxxxxx",
        ...
      }
      ...
    }
    ...
  },
  "oldTestament": {
	   ...
  }
}
```
约定：
针对某些版本在翻译某些经节的时候选择把某几节连着翻译的情况，key的值使用"-"分隔，比如"2-3"

### 数据访问层接口设计
* Interface
  1. `Bible` createBible(name, language, version, origin)
  2.

### 建模
  对于系统设计，我觉得最最重要的是建模，要好好的分析需求，分析问题，然后考虑使用哪种模型
  来解决这个问题。
  对于bible-crawler这个项目，分析需求，分析实现，其实本质上就是有一个index.html，然后
  我爬出一些圣经版本，语言等基本信息，以及更深一层的url，比如各种书（创世纪，出埃及记等）
  的url，然后我就在根据这些book的url来再次爬，爬出这些书的一些信息，这里可能只有章节信息，
  以及章的url，然后在根据章的url，在爬，爬出节的信息。
  一般的爬虫无非就是这个模型，这个很像一个树的遍历，从上到下，想到对xml的解析除了dom方式，
  还有一种叫sax，是一种无需将整个xml装载进入内存，使用流和事件，从而使用最小的系统资源，
  达到对xml解析的目的。
  其实，仔细想爬虫也是非常类似，因为爬虫所爬的资源就像xml结构一样是有层级结构，当然我们
  也可以像dom一样，把所有的数据都爬出来，在内存中建立模型，但是如果所爬的资源很大的时候，
  所占用的内存就非常大，而且中间任何出现问题，所爬的数据都没有保存下来。
  所以对于爬虫，最好的就是一边爬，一边执行业务操作（比如在这里是数据保存），那么，问题的
  关键是如何清楚的将业务操作，这些与爬虫无关的东西友好的暴露出来，而不是跟爬虫的逻辑耦合
  在一起。
  如果按照在面向对象中的习惯做法，应该是提前设置回调函数，但是，在这里我非常喜欢事件的订阅
  机制，那么爬虫就是一个系统，通过事件，把系统执行过程中的一些数据暴露出来。

#### 事件
  * `bible`
    ``` javascript
    {
      name: '圣经和合本',
      version: '和合本',
      language: '简体中文',
      index: 'http://www.o-bible.com/gb/hgb.html',
      host: 'http://www.o-bible.com/',
    }
    ```
  * `testament`
    ``` javascript
    {
      name: '旧约全书',
      isNew: false,
      booksCount: 39,
      bible: [object],
    }
    ```
  * `book`
    ``` javascript
    {
      name: '创世纪',
      chapters: 50,
      testament: [object],
    }
    ```
  * `chapter`
  ``` javascript
  {
    chapterNo: '1',
    sectionCount: 31,
    book: [object],
  }
  ```
  * `section`
  ``` javascript
  {
    sectionNo: '1',
    text: '起初，神创造天地',
    chapter: [object],
  }
  ```
  * `bible-end`
  ``` javascript
  {
    name: '圣经和合本',
    version: '和合本',
    language: '简体中文',
    index: 'http://www.o-bible.com/gb/hgb.html',
    host: 'http://www.o-bible.com/',
  }
  ```
  * `testament-end`
  ``` javascript
  {
    name: '旧约全书',
    isNew: false,
    booksCount: 39,
    bible: [object],
  }
  ```
  * `book-end`
  ``` javascript
  {
    name: '创世纪',
    chapters: 50,
    testaement: [object],
  }
  ```
  * `chapter-end`
  ``` javascript
  {
    chapterNo: '1',
    sectionCount: 31,
    book: [object],
  }
  ```
  * `section-end`
  ``` javascript
  {
    sectionNo: '1',
    text: '起初，神创造天地',
    chapter: [object],
  }
  ```
