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
{
  language:'Chinese',
  version: '和合本',
  origin: {
    main: 'http://www.o-bible.com/',
    index: 'http://www.o-bible.com/gb/hgb.html',
    },
  newTestament: {
    name: '新约全书',
    '马太福音': {
      '1': {
        '1': 'xxxxxx',
        ...
      }
      ...
    }
    ...
  }
  oldTestament: {
	   ...
  }
}
约定：
针对某些版本在翻译某些经节的时候选择把某几节连着翻译的情况，key的值使用"-"分隔，比如"2-3"

### 数据访问层接口设计
* Interface
  1. `Bible` createBible(name, language, version, origin)
  2.
