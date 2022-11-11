const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
// const image_uri = ['https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3','https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943']
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content_short: 'mock data',
    content: baseContent,
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft'],
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri,
    platforms: ['a-platform']
  }))
}

module.exports = [
  {
    url: '/vue-admin-template/table/list',
    type: 'get',
    response: config => {
      const { importance, type, title, status,display_time, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (title && item.title.indexOf(title) < 0) return false
        if (status && item.status !== status) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },
  {
    url: '/vue-element-admin/article/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/vue-element-admin/article/delete',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/vue-element-admin/table/detail',
    type: 'post',
    response: config => {
      const { id } = config.query
      for (const article of List) {
        if (article.id === +id) {
          console.log('id',id)
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },
  {
    url: '/vue-element-admin/table/sites',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: ['成都成都成都成都成都',"长春","合肥"]
      }
    }
  },
  {
    url: '/vue-element-admin/article/submitForm',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/vue-element-admin/article/draftForm',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/vue-element-admin/table/getDL',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: [{
          value: 'daohang',
          label: '导航',
          children: [{
            value: 'cexiangdaohang',
            label: '侧向导航'
          }, {
            value: 'dingbudaohang',
            label: '顶部导航'
          }]
        }]
      }
    }
  },
  {
    url: '/vue-element-admin/table/file',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: {
          url: 'http://localhost:9528/ea364369-7534-4cca-8d27-08ae9a3dddec'
        }
      }
    }
  }
]
