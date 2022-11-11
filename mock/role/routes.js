// Just a mock data



const constantRoutes = [
  {
    path: '/redirect',
    component: 'layout/Layout',
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component:'views/redirect/index'
      }
    ]
  },
  {
    path: '/login',
    component:'views/login/index',
    hidden: true
  },

  {
    path: '/404',
    component:'views/404',
    hidden: true
  },

  {
    path: '/',
    component: 'layout/Layout',
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component:'views/dashboard/index',
      meta: { title: '主页', icon: 'dashboard', affix: true }
    }]
  }
]

const asyncRoutes = [
  {
    path: '/example',
    component: 'layout/Layout',
    redirect: '/example/list',
    name: 'Example',
    meta: { title: '案例中心', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'list',
        name: 'ListArticle',
        component:'views/example/index',
        meta: { title: '文章列表', icon: 'list' },
      },
      {
        path: 'edit/:id(\\d+)',
        name: 'EditArticle',
        component:'views/example/edit',
        meta: { title: '编辑文章' },
        hidden: true
      },
      {
        path: 'create',
        name: 'CreateArticle',
        component:'views/example/create',
        meta: { title: '添加文章', icon: 'edit' }
      }
    ]
  },
  {
    path: '/tree',
    component: 'layout/Layout',
    children: [
      {
        path: 'tree',
        name: 'Tree',
        component:'views/tree/index',
        meta: { title: '树状图', icon: 'tree' }
      }
    ]
  },
  {
    path: '/permission',
    component: 'layout/Layout',
    redirect: '/permission/index',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: '权限设置',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'page',
        component:'views/permission/page',
        name: 'PagePermission',
        meta: {
          title: '页面权限',
          roles: ['admin'] // or you can only set roles in sub nav
        },
        hidden: true
      },
      {
        path: 'directive',
        component:'views/permission/directive',
        name: 'DirectivePermission',
        meta: {
          title: '权限管理'
          // if do not set roles, means: this page does not require permission
        },
        hidden: true
      },
      {
        path: 'role',
        component:'views/permission/role',
        name: 'RolePermission',
        meta: {
          title: '角色权限',
          roles: ['admin']
        }
      }
    ]
  },
  // 404 page must be placed at the end !!! 
  // 这个必须在动态路由配置，不能放在静态路由中，否则会刷新404
  { path: '*', redirect: '/404', hidden: true }
]

module.exports = {
  constantRoutes,
  asyncRoutes
}
