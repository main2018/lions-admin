import request from '@/utils/request'

const PAGE_SIZE = 20

export function createNotice(data) {
  return request({
    url: 'notice/add',
    method: 'post',
    data
  })
}

export function getNotice(query) {
  return request({
    url: 'notice/noticePage',
    method: 'post',
    data: Object.assign({ pageSize: PAGE_SIZE }, query)
  })
}
