<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container" label-width="80px">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" :disabled="loading" @click="submitForm">
          发布
        </el-button>
        <!-- <el-button type="warning" :disabled="loading" @click="draftForm">
          草稿
        </el-button> -->
      </sticky>
      <div class="createPost-main-container">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="postForm.title" placeholder="请输入通知标题"></el-input>
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <el-input v-model="postForm.content" type="textarea" :rows="10" placeholder="请输入通知内容"></el-input>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
/* eslint-disable */
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { CategoryDropdown } from './Dropdown'
import { createNotice } from '@/api/notice'

const defaultForm = {
  title: '',
  content: ''
}

export default {
  name: 'ActivityDetail',
  components: { Tinymce, MDinput, Upload, Sticky, CategoryDropdown },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateStatus = (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('请选择文章状态'))
      } else {
        callback()
      }
    }
    const validateCover = (rule, value, callback) => {
      console.log('111')
      if (!value[0].url) {
        callback(new Error('请上传封面'))
      } else {
        callback()
      }
    }
    return {
      statusArr: [
        { id: 0, name: '未发布' },
        // { id: 1, name: '发布' },
        // { id: 5, name: '删除' }
      ],
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        title: [{ required: true, message: '请填写通知标题', trigger: 'blur' }],
        content: [{ required: true, message: '请填写通知内容', trigger: 'blur' }]
      },
      tempRoute: {},
      categories: null,
      mapData: {}
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content_short.length
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  created() {
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)

    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      const isDraft = this.$route.query.isDraft
      if (isDraft) {
        const data = this.getStorage('articles', id)
        console.log('data', data)
        this.postForm = data
        this.setTagsViewTitle()
        // // set page title
        this.setPageTitle()
      } else this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }

    this.formatDate()
  },
  methods: {
    formatDate() {
      Date.prototype.Format = function (fmt) { // author: meizz
        var o = {
          "M+": this.getMonth() + 1, // 月份
          "d+": this.getDate(), // 日
          "h+": this.getHours(), // 小时
          "m+": this.getMinutes(), // 分
          "s+": this.getSeconds(), // 秒
          "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
          "S": this.getMilliseconds() // 毫秒
        }
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
              return fmt
      }
    },
    fetchData(id) {
    },
    setTagsViewTitle() {
      const title = '编辑活动'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.title}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '编辑活动'
      document.title = `${title} - ${this.postForm.title}`
    },
    submitForm() {
      this.$refs.postForm.validate((valid, result) => {
        if (valid) {
          createNotice(this.postForm).then(() => {
            this.$notify({
              title: '成功',
              message: `操作成功`,
              type: 'success',
              duration: 2000
            })
            this.$router.replace('/notice/list')
          })
        } else {
          const message = ((Object.values(result)[0] || [])[0] || {}).message || '您有未填写的字段'
          this.$message.error(message);
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      console.log(this.postForm)
      const data = {...this.postForm}

      data.status = -1
      data.createAt = Date.now()
      if (!this.isEdit) data.id = Date.now().toString()
      this.setStorage('activies', data)
      this.$message({
        message: '已存入草稿箱',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.$router.replace('/activity/list?isDraft=true')
    },
    getStorage(key, id) {
      if (!key || !id) return

      const arr = JSON.parse(localStorage.getItem(key) || '[]')
      const obj = arr.find(item => item.id === id)
      return obj
    },
    setStorage(key, val) {
      if (!key || !val) return

      const arr = JSON.parse(localStorage.getItem(key) || '[]')
      if (this.isEdit) {
        const index = arr.findIndex(item => item.id === val.id)
        arr.splice(index, 1, val)
      } else arr.push(val)
      localStorage.setItem(key, JSON.stringify(arr))
    },
    delStorage(key, id) {
      if (!key || !id) return

      const arr = JSON.parse(localStorage.getItem(key) || '[]')
      const index = arr.findIndex(item => item.id === id)
      arr.splice(index, 1)

      localStorage.setItem(key, JSON.stringify(arr))
    },
    getRemoteUserList(query) {
      searchUser(query).then(response => {
        if (!response.data.items) return
        this.userListOptions = response.data.items.map(v => v.name)
      })
    },
    getCategory() {
      getCategory().then(resp => {
        console.log('resp', resp)
        this.categories = resp.data && resp.data.list
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.article-header{
  margin-bottom: 40px;
  display: flex;
  align-items: flex-end;
  .avatar-uploader{
    width: 150px;
    height: 150px;
    line-height: 150px;
  }
  &-content{
    margin-left: 20px;
    flex: 1;
  }
}

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;
    max-width: 900px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea /deep/ {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
