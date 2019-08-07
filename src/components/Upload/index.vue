<template>
  <el-upload
    class="avatar-uploader"
    action="http://up-z2.qiniu.com"
    :data="uptoken"
    :multiple="false"
    :show-file-list="false"
    :before-upload="beforeUpload"
    :on-success="handleImageSuccess"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar">
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
  </el-upload>
</template>

<script>
import { getToken } from '@/api/qiniu'
import { qiniuDomain } from '~/config/qiniu'

export default {
  name: 'ImageUpload',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tempUrl: this.value,
      uptoken: { token: '', key: '' }
    }
  },
  computed: {
    imageUrl() {
      const val = this.value
      const reg = /^http/i
      return !val ? '' : reg.test(val) ? val : qiniuDomain + val
    }
  },
  methods: {
    rmImage() {
      this.emitInput('')
    },
    emitInput(val) {
      this.$emit('input', val)
    },
    handleImageSuccess(resp, file, fileList) {
      const url = qiniuDomain + resp.key
      console.log('tempUrl', url)
      this.tempUrl = url
      this.emitInput(resp.key)
    },
    beforeUpload(file) {
      const imageReg = /^image/
      const type = file.type

      if (!imageReg.test(type)) {
        this.$message.error('请上传图片')
        return false
      }

      return new Promise((resolve, reject) => {
        getToken().then(response => {
          const spaceReg = /\s|\(|\)/g
          const key = Date.now() + this.makeRandom() + file.name.replace(spaceReg, '')
          const token = response.data && response.data.token

          if (!token) return reject(false)
          this.uptoken.token = token
          this.uptoken.key = key
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(false)
        })
      })
    },
    makeRandom(size = 3) {
      const num = ~~(Math.random() * 1000)
      const arr = []
      arr.length = size
      arr.fill(0)
      return Number((num + arr.join()).substring(0, size))
    }
  }
}
</script>

<style lang="scss">
.avatar-uploader{
  width: 178px;
  height: 178px;
  line-height: 178px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: inherit;
  height: inherit;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: inherit;
  height: inherit;
  line-height: inherit;
  text-align: center;
}
.avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
</style>
