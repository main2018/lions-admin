import request from '@/utils/request'

export function addModule(data) {
  return request({
    url: 'Module/add',
    method: 'post',
    data
  })
}

export function updateModule(id, data) {
  data.id = id
  return request({
    url: 'Module/update',
    method: 'post',
    data
  })
}

export function delModule(id) {
  return request({
    url: 'Module/delete',
    method: 'post',
    data: { id }
  })
}

export function getModule(id) {
  return request({
    url: 'Module/findModule',
    method: 'post',
    data: { id }
  })
}

export function getModules() {
  return request({
    url: 'Module/findModule',
    method: 'post'
  })
}
