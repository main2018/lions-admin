import request from '@/utils/request'
import { deepClone } from '../../src/utils/index.js'

import Layout from '@/layout'

// Just a mock data

export const constantRoutes = [
  {
    path: '/redirect',
    component: 'layout/Layout',
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: 'views/redirect/index'
      }
    ]
  },
  {
    path: '/login',
    component: 'views/login/index',
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: 'views/login/auth-redirect',
    hidden: true
  },
  {
    path: '/404',
    component: 'views/error-page/404',
    hidden: true
  },
  {
    path: '/401',
    component: 'views/error-page/401',
    hidden: true
  },
  {
    path: '',
    component: 'layout/Layout',
    redirect: '/dashboard',
    hidden: true,
    children: [
      {
        path: 'dashboard',
        component: 'views/dashboard/index',
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/permission',
    component: 'layout/Layout',
    redirect: '/permission/index',
    alwaysShow: true,
    name: 'Permission',
    meta: {
      title: '权限管理',
      icon: 'lock',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'role',
        component: 'views/permission/role',
        name: 'RolePermission',
        meta: {
          title: '角色管理'
        }
      },
      {
        path: 'member',
        component: 'views/permission/member',
        name: 'MemberPermission',
        meta: {
          title: '成员管理'
        }
      }
    ]
  },
  {
    path: '/article',
    component: 'layout/Layout',
    redirect: '/article/list',
    name: 'Article',
    meta: {
      title: '文章',
      icon: 'example'
    },
    children: [
      {
        path: 'create',
        component: 'views/article/create',
        name: 'CreateArticle',
        meta: { title: '创建文章', icon: 'edit' }
      },
      {
        // path: 'edit/:id(\\d+)',
        path: 'edit/:id(\\w+)',
        component: 'views/article/edit',
        name: 'EditArticle',
        meta: { title: '编辑文章', noCache: true, activeMenu: '/article/list' },
        hidden: true
      },
      {
        path: 'list',
        component: 'views/article/list',
        name: 'ArticleList',
        meta: { title: '文章列表', icon: 'list', noCache: true } // noCache: true,跳转时刷新，重新请求数据
      },
      {
        path: 'category',
        component: 'views/article/category',
        name: 'ArticleCategory',
        meta: { title: '文章分类', icon: 'list' }
      }
    ]
  },
  {
    path: '/activity',
    component: 'layout/Layout',
    redirect: '/activity/list',
    name: 'Activity',
    meta: {
      title: '活动',
      icon: 'example'
    },
    children: [
      {
        path: 'create',
        component: 'views/activity/create',
        name: 'CreateActivity',
        meta: { title: '创建活动', icon: 'edit' }
      },
      {
        path: 'list',
        component: 'views/activity/list',
        name: 'ActivityList',
        meta: { title: '活动列表', icon: 'list', noCache: true } // noCache: true,跳转时刷新，重新请求数据
      },
      {
        path: 'check',
        component: 'views/activity/check',
        name: 'ActivityCheck',
        meta: { title: '活动审核', icon: 'list', noCache: true } // noCache: true,跳转时刷新，重新请求数据
      }
    ]
  },
  {
    path: '/notice',
    component: 'layout/Layout',
    redirect: '/notice/create',
    name: 'Notice',
    meta: {
      title: '通知',
      icon: 'example'
    },
    children: [
      {
        path: 'create',
        component: 'views/notice/create',
        name: 'CreateNotice',
        meta: { title: '创建通知', icon: 'edit' }
      },
      {
        path: 'list',
        component: 'views/notice/list',
        name: 'NoticeList',
        meta: { title: '通知列表', icon: 'list' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

export const asyncRoutesMap = [
  {
    Permission: Layout,
    children: [
      { RolePermission: () => import('@/views/permission/role') },
      { MemberPermission: () => import('@/views/permission/member') }
    ]
  },
  {
    Article: Layout,
    children: [
      { CreateArticle: () => import('@/views/article/create') },
      { EditArticle: () => import('@/views/article/edit') },
      { ArticleList: () => import('@/views/article/list') },
      { ArticleCategory: () => import('@/views/article/category') }
    ]
  },
  {
    Activity: Layout,
    children: [
      { CreateActivity: () => import('@/views/activity/create') },
      { ActivityList: () => import('@/views/activity/list') },
      { ActivityCheck: () => import('@/views/activity/check') }
    ]
  },
  {
    Notice: Layout,
    children: [
      { CreateNotice: () => import('@/views/notice/create') },
      { NoticeList: () => import('@/views/notice/list') }
    ]
  }
]

const routes = deepClone([...constantRoutes, ...asyncRoutes])

const roles = [
  {
    // key: 'admin',
    name: 'admin',
    // description: 'Super Administrator. Have access to view all pages.',
    routes: routes
  },
  {
    name: 'editor',
    routes: routes.filter(i => i.path !== '/permission')// just a mock
  },
  {
    name: 'visitor',
    routes: [
      {
        path: '/article',
        component: 'layout/Layout',
        redirect: '/article/list',
        name: 'Article',
        meta: {
          title: '文章',
          icon: 'example'
        },
        children: [
          {
            path: 'create',
            component: 'views/article/create',
            name: 'CreateArticle',
            meta: { title: '创建文章', icon: 'edit', roles: ['admin'] }
          },
          {
            // path: 'edit/:id(\\d+)',
            path: 'edit/:id(\\w+)',
            component: 'views/article/edit',
            name: 'EditArticle',
            meta: { title: '编辑文章', noCache: true, activeMenu: '/article/list' },
            hidden: true
          },
          {
            path: 'list',
            component: 'views/article/list',
            name: 'ArticleList',
            meta: { title: '文章列表', icon: 'list', noCache: true } // noCache: true,跳转时刷新，重新请求数据
          },
          {
            path: 'category',
            component: 'views/article/category',
            name: 'ArticleCategory',
            meta: { title: '文章分类', icon: 'list' }
          }
        ]
      }
    ]
  }
]
console.log('constRole', roles)

export function getRoutes() {
  // return request({
  //   url: '/routes',
  //   method: 'get'
  // })
  return Promise.resolve({ data: routes })
}

export function getRoles() {
  return request({
    url: 'role/rolePage',
    method: 'post'
  })
  // return Promise.resolve({ data: roles })
}

export function addRole(data) {
  return request({
    url: 'role/add',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

export function updateRole(id, data) {
  return request({
    url: `role/update`,
    method: 'post',
    data: {
      id,
      ...data
    },
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

export function deleteRole(id) {
  return request({
    url: `/role/${id}`,
    method: 'delete'
  })
}
