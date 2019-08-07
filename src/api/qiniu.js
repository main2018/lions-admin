/* eslint-disable */
import request from '@/utils/request'
import { Message } from 'element-ui'
import { qiniuDomain } from '~/config/qiniu'

export function getToken() {
  return request({
    url: 'qiniu/token',
    method: 'post'
  })
}

// const qiniuDomain = 'http://img.tukeshare.com/'

export async function qiniuUpload(file, progress = () => {}) {
  const resp = await getToken()
  const token = resp && resp.data && resp.data.token

  if (!token) {
    Message({
      message: '图片上传异常，未获取到token',
      type: 'error',
      duration: 5 * 1000
    })
    throw new Error('图片上传异常，未获取到token')
  }

  // let blob = await imageCorrection(file)
  // blob = await compressWithSize(blob)
  // axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  // await _loadScript()
  // const fileNames = file.name.split('.')
  // const spaceReg = /\s/g
  const spaceReg = /\s|\(|\)/g
  let key = Date.now() + makeRandom() + file.name.replace(spaceReg, '')
  // let key = encodeURI(fileNames[0] + Date.now() + makeRandom()) + '.' + fileNames[1]
  
  return await new Promise((resolve, reject) => {
    const error = err => {
      Toast(err)
      console.log('qiniu Error:', err)
      reject(err)
    }
    const complete = (res) => {
      console.log('res', res)
      const resUrl = qiniuDomain + res.key
      Message({
        message: '上传成功',
        type: 'success',
        duration: 5 * 1000
      })
      resolve(resUrl)
    };
  
    var next = (response) => {
      progress(response && response.total && response.total.percent)
    }
  
    const config = {
      useCdnDomain: false,
      disableStatisticsReport: false,
      retryCount: 6,
      region: qiniu.region.z2
    }
    const putExtra = {
      fname: file.name,
      params: {},
      mimeType: null
    }
  
    const subObject = {
      next,
      error,
      complete,
    }
  
    const observable = qiniu.upload(file, key, token, putExtra, config)
    const subscription = observable.subscribe(subObject)
  })
}

function _loadScript () {
  return new Promise((resolve, reject) => {
    let $script = document.createElement('script')
    document.head.appendChild($script)
    $script.src = 'https://unpkg.com/qiniu-js@2.2.0/dist/qiniu.min.js'
    $script.onload = resolve
    $script.onerror = reject
  })
}
function makeRandom(size = 3) {
  let num = ~~(Math.random() * 1000)
  let arr = []
  arr.length = size
  arr.fill(0)
  return Number((num + arr.join()).substring(0, size))
}
