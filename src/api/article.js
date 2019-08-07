import request from '@/utils/request'
const PAGE_SIZE = 20

export function fetchList(query) {
  return request({
    url: 'article/articlePage',
    method: 'post',
    data: Object.assign({ pageSize: PAGE_SIZE }, query)
  })
}

export function fetchArticle(id) {
  return request({
    url: `article/findArticleById`,
    method: 'post',
    data: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'post',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: 'article/add',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: `article/update`,
    method: 'post',
    data
  })
}
