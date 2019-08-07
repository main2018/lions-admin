import request from '@/utils/request'
const PAGE_SIZE = 20

export function fetchList(query) {
  return request({
    url: 'activies/activiesPage',
    method: 'post',
    data: Object.assign({ pageSize: PAGE_SIZE }, query)
  })
}

export function fetchActivity(id) {
  return request({
    url: `activies/findActiviesById`,
    method: 'post',
    data: { id }
  })
}

export function createActivity(data) {
  return request({
    url: 'activies/add',
    method: 'post',
    data
  })
}

export function updateActivity(data) {
  return request({
    url: `activies/update`,
    method: 'post',
    data
  })
}
