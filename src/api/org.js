import request from '@/utils/request'

export function getOrgs(data) {
  return request({
    url: 'org/orgPage',
    method: 'post',
    data: Object.assign({ pageSize: 10000 }, data)
  })
}

export function addOrg(data) {
  return request({
    url: 'org/add',
    method: 'post',
    data
  })
}

export function updateOrg(data) {
  return request({
    url: 'org/update',
    method: 'post',
    data
  })
}

export function delOrg(id) {
  return request({
    url: 'org/delete',
    method: 'post',
    data: { id }
  })
}

export function getOrgById(id) {
  return request({
    url: 'org/find',
    method: 'post',
    data: { id }
  })
}
