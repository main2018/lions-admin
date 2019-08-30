import request from '@/utils/request'

export function addUserorg(data) {
  return request({
    url: 'userOrg/add',
    method: 'post',
    data
  })
}

export function delUserorg(id) {
  return request({
    url: 'userOrg/delete',
    method: 'post',
    data: { id }
  })
}

export function updateUserorg(data) {
  return request({
    url: 'userOrg/update',
    method: 'post',
    data
  })
}

export function getUserorgs(data) {
  return request({
    url: 'userOrg/userOrgPage',
    method: 'post',
    data
  })
}

export function getUserorgsByPid(pId) {
  return request({
    url: 'userOrg/findByPid',
    method: 'post',
    data: { pId }
  })
}
