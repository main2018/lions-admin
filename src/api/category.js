import request from '@/utils/request'

export function getCategories() {
  return request({
    url: 'articleType/articleTypePage',
    method: 'post'
  })
}

export function getCategory(isQuestion = false) {
  return request({
    url: 'articleType/articleTypePage',
    method: 'post',
    params: { type: +isQuestion }
  })
}

export function addCategory(data) {
  return request({
    url: 'articleType/add',
    method: 'post',
    data
  })
}

export function updateCategory(id, data) {
  data.id = id
  return request({
    url: `articleType/update`,
    method: 'post',
    data
  })
}

export function delCategory(id) {
  return request({
    url: `articleType/delete`,
    method: 'post',
    data: { id }
  })
}
