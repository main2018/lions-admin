import request from '@/utils/request'

const PAGE_SIZE = 10

export function createQuestion(data) {
  return request({
    url: 'question',
    method: 'post',
    data
  })
}

export function updateQuestion(data) {
  const id = data._id
  const copyData = { ...data }
  delete copyData._id

  return request({
    url: `question/update/${id}`,
    method: 'put',
    data: copyData
  })
}

export function fetchQuestions(data) {
  return request({
    url: `question/list`,
    method: 'get',
    params: Object.assign({ pageSize: PAGE_SIZE }, data)
  })
}

export function fetchQuestion(id) {
  return request({
    url: `question/find/${id}`,
    method: 'get'
  })
}

export function createAnswer(data) {
  return request({
    url: 'answer',
    method: 'post',
    data
  })
}

export function fetchAnswer() {
  return request({
    url: `answer/list`,
    method: 'get'
  })
}

export function fetchAnswers(pId) {
  return request({
    url: `answer/list`,
    method: 'get',
    params: { pId }
  })
}

export function updateAnswer(data) {
  const id = data._id
  const copyData = { ...data }
  delete copyData._id

  return request({
    url: `answer/update/${id}`,
    method: 'put',
    data: copyData
  })
}
