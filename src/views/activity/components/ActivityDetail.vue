<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container" label-width="80px">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-form-item style="margin-bottom: 0; display: inline-block;" prop="status" :show-message="false">
          <CategoryDropdown v-model="postForm.status" :list="statusArr" placeholder="选择文章状态" />
        </el-form-item>
        <!-- <CategoryDropdown v-model="postForm.typeId" :list="categories" placeholder="选择文章类别" /> -->
        <!-- <PlatformDropdown v-model="postForm.platforms" /> -->
        <!-- <SourceUrlDropdown v-model="postForm.source_uri" /> -->
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" :disabled="loading" @click="submitForm">
          发布
        </el-button>
        <el-button type="warning" :disabled="loading" @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-tabs type="border-card">
          <el-tab-pane label="基本信息">
            <el-form-item label="活动标题" prop="title">
              <el-input v-model="postForm.title"></el-input>
            </el-form-item>
            <el-form-item label="活动封面" prop="urls">
              <Upload v-model="postForm.urls[0].url"></Upload>
            </el-form-item>
            <el-form-item label="参与人数" prop="limitNum">
              <el-input-number v-model="postForm.limitNum" label="参与人数" :min="1" :max="10"></el-input-number>
            </el-form-item>
            <el-form-item prop="startDate" label="活动时间">
              <el-date-picker
                v-model="postForm.startDate"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="报名时间" prop="regStartDate">
              <el-date-picker
                v-model="postForm.regStartDate"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
              >
              </el-date-picker>
            </el-form-item>
            <!-- <el-form-item label="活动地点" prop="address">
              <place v-model="postForm.address"></place>
            </el-form-item> -->
          </el-tab-pane>
          <el-tab-pane label="活动地点">
            <v-map v-model="mapData"></v-map>
          </el-tab-pane>
          <el-tab-pane label="活动详情">
            <Tinymce ref="editor" v-model="postForm.details" :height="400" />
          </el-tab-pane>
        </el-tabs>
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
import { validURL } from '@/utils/validate'
import { fetchActivity, createActivity, updateActivity } from '@/api/activity'
import { searchUser } from '@/api/remote-search'
import { getCategory } from '@/api/category'
import Warning from './Warning'
import { CategoryDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'
import Place from './Place'
import Map from './map'

const defaultForm = {
  // status: 'draft',
  status: 0, // 0 未发布 1 发布 2 取消 5 删除（-1 自增，草稿）
  title: '', // 活动题目
  details: '', // 活动内容
  limitNum: 0, // 参与人数
  startDate: '',
  endDate: '',
  regStartDate: '', // 活动报名开始时间
  regEndDate: '',
  urls: [{ type: 0, url: '' }], // 封面
  address: '', // 活动地点
  lng: 0, // 经度
  lat: 0
}

export default {
  name: 'ActivityDetail',
  components: { Tinymce, MDinput, Upload, Sticky, Warning, CategoryDropdown, PlatformDropdown, SourceUrlDropdown, Place, 'v-map': Map },
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
        status: [{ validator: validateStatus, trigger: 'blur' }],
        title: [{ required: true, message: '标题必填' }],
        urls: [{ validator: validateCover, trigger: 'blur' }],
        startDate: [{ required: true, message: '请选择活动开始时间' }],
        endDate: [{ required: true, message: '请选择活动结束时间' }],
        regStartDate: [{ required: true, message: '请选择报名开始时间' }],
        regEndDate: [{ required: true, message: '请选择报名结束时间' }],
        details: [{ required: true, message: '请填写活动内容' }],
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

    this.getCategory()

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
      fetchActivity(id).then(response => {
        const article = response.data || {}
        
        this.postForm.id = ''
        for (const key in this.postForm) {
          if (article.hasOwnProperty(key)) {
            if (key === 'urls' && (!article[key] || !article[key].length)){
              continue
            }
            this.postForm[key] = article[key]
          }
        }
        console.log('postForm', this.postForm)
        const _formatDate = key => {
          const dateStr = this.postForm[key]
          return dateStr.split(' ')[0]
        }

        this.postForm.startDate = [_formatDate('startDate'), _formatDate('endDate')]
        this.postForm.regStartDate = [_formatDate('regStartDate'), _formatDate('regEndDate')]

        const { lng, lat, address } = this.postForm
        this.mapData = { address, location: `${lng},${lat}` }

        // just for test
        // this.postForm.title += `   Article Id:${this.postForm.id}`
        // this.postForm.content_short += `   Article Id:${this.postForm.id}`

        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
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
      if (!this.mapData.address) return this.$message.warning('请选择活动地点')

      this.$refs.postForm.validate((valid, result) => {
        if (valid) {
          this.loading = true
          const api = this.isEdit ? updateActivity : createActivity
          const text = this.isEdit ? '修改' : '发布'

          const data = { ...this.postForm }
          data.startDate = this.postForm.startDate[0]
          data.endDate = this.postForm.startDate[1]
          data.regStartDate = this.postForm.regStartDate[0]
          data.regEndDate = this.postForm.regStartDate[1]
          data.urls = JSON.stringify(data.urls)

          data.address = `(${this.mapData.name})${this.mapData.address}` 
          data.lng = this.mapData.location.split(',')[0]
          data.lat = this.mapData.location.split(',')[1]
          console.log(data)
          api(data).then(resp => {
            this.$notify({
              title: '成功',
              message: `${text}活动成功`,
              type: 'success',
              duration: 2000
            })
            this.delStorage('activies', this.postForm.id)
            this.$router.replace('/activity/list')
          }).finally(() => { this.loading = false })
          // this.postForm.status = 'published'
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
