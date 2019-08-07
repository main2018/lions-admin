import fetch from '~/common/utils/fetch'

export function getOrg(params) {
  return fetch({
    url: 'org/orgPage',
    method: 'post',
    params,
  })
}
