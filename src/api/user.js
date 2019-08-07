import request from '@/utils/request'
import { getUser } from '@/utils/auth'

const avatarBase = require('@/assets/images/avatar.png')

export function login(data) {
  return request({
    url: 'user/oauth',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  const { username: name, headImageUrl: avatar, id } = getUser() || {}
  const data = {
    id,
    roles: ['admin'],
    name,
    avatar: avatar || avatarBase,
    introduction: '自我介绍'
  }
  return Promise.resolve({ data })
  // return request({
  //   url: '/user/info',
  //   method: 'get',
  //   params: { token }
  // })
}

export function logout() {
  return Promise.resolve()
  // return request({
  //   url: '/user/logout',
  //   method: 'post'
  // })
}

export function getUsers() {
  return request({
    url: 'user/userPage',
    method: 'post'
  })
}

export function updateUser(id, data) {
  return request({
    url: 'user/update',
    method: 'post',
    data: { id, ...data }
  })
}

export function userRole(userId, roleIds = []) {
  const data = roleIds.map(roleId => ({ userId, roleId }))
  return request({
    url: 'roleUser/update',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}

export function getUserRole(userId) {
  return request({
    url: 'roleUser/page',
    method: 'post',
    data: { userId }
  })
}
