<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <el-form-item style="margin-bottom: 0; display: inline-block;" prop="status" :show-message="false">
          <CategoryDropdown v-model="postForm.status" :list="statusArr" placeholder="选择文章状态" />
        </el-form-item>
        <CategoryDropdown v-model="postForm.typeId" :list="categories" placeholder="选择文章类别" />
        <!-- <PlatformDropdown v-model="postForm.platforms" /> -->
        <!-- <SourceUrlDropdown v-model="postForm.source_uri" /> -->
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <!-- <Warning /> -->

          <el-col :span="24">
            <div class="article-header">
              <el-form-item style="margin-bottom: 0;" prop="coverImg">
                <Upload v-model="postForm.coverImg"></Upload>
              </el-form-item>
              <div class="article-header-content">
                <el-form-item style="margin-bottom: 20px;" prop="title">
                  <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                    文章标题 *
                  </MDinput>
                </el-form-item>
                <el-form-item style="margin-bottom: 0;" label="">
                  <el-input v-model="postForm.theme" type="textarea" :rows="4" resize="none" placeholder="请填写文章简介"></el-input>
                </el-form-item>
              </div>
            </div>
            <!-- <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="Author:" class="postInfo-container-item">
                    <el-select v-model="postForm.author" :remote-method="getRemoteUserList" filterable default-first-option remote placeholder="Search user">
                      <el-option v-for="(item,index) in userListOptions" :key="item+index" :label="item" :value="item" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item label-width="120px" label="Publish Time:" class="postInfo-container-item">
                    <el-date-picker v-model="displayTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Select date and time" />
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label-width="90px" label="Importance:" class="postInfo-container-item">
                    <el-rate
                      v-model="postForm.importance"
                      :max="3"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      :low-threshold="1"
                      :high-threshold="3"
                      style="display:inline-block"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div> -->
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="70px" label="关键字:">
          <el-input v-model="postForm.keyWord" :rows="1" type="textarea" class="article-textarea" autosize placeholder="文章关键字（以逗号‘，’隔开）" />
          <!-- <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span> -->
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.content" :height="400" />
        </el-form-item>

        <!-- <el-form-item prop="image_uri" style="margin-bottom: 30px;">
          <Upload v-model="postForm.image_uri" />
        </el-form-item> -->
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
import { fetchArticle, createArticle, updateArticle } from '@/api/article'
import { searchUser } from '@/api/remote-search'
import { getCategory } from '@/api/category'
import Warning from './Warning'
import { CategoryDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'

import { getUser } from '@/utils/auth'

const defaultForm = {
  // status: 'draft',
  status: 1, // 0 未发布 1 发布 2 删除 （-1 自增，草稿）
  title: '', // 文章题目
  theme: '', // 文章摘要
  coverImg: '', // 封面
  content: '', // 文章内容
  typeId: '', // 文章分类ID
  keyWord: '', // 文章标签
}

export default {
  name: 'ArticleDetail',
  components: { Tinymce, MDinput, Upload, Sticky, Warning, CategoryDropdown, PlatformDropdown, SourceUrlDropdown },
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
    return {
      statusArr: [
        { id: 0, name: '未发布' },
        { id: 1, name: '发布' },
        { id: 5, name: '删除' }
      ],
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        status: [{ validator: validateStatus, trigger: 'blur' }],
        title: [{ required: true, message: '文章标题必填' }],
        coverImg: [{ required: true, message: '请上传文章封面' }],
        typeId: [{ required: true, message: '请选择文章类别', trigger: 'blur' }],
        content: [{ required: true, message: '请填写文章内容' }],
      },
      tempRoute: {},
      categories: null
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
        this.postForm = data
        this.setTagsViewTitle()
        // // set page title
        this.setPageTitle()
      } else this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }
    console.log(getUser())
  },
  methods: {
    fetchData(id) {
      fetchArticle(id).then(response => {
        const article = response.data || {}
        console.log('article', article)
        this.postForm.id = ''
        this.postForm.creatorId = ''
        this.postForm.creator = ''
        this.postForm.creatorHead = ''
        for (const key in this.postForm) {
          if (article.hasOwnProperty(key)) this.postForm[key] = article[key]
        }
        console.log('postForm', this.postForm)

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
      const title = '编辑文章'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.title}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '编辑文章'
      document.title = `${title} - ${this.postForm.title}`
    },
    submitForm() {
      if (!this.postForm.typeId) return this.$message.error('请选择文章类别')

      if (!this.isEdit) {
        const { id: creatorId, wxNickName, realname, username, headImageUrl: creatorHead } = getUser() || {}
        this.postForm.creatorId = creatorId
        this.postForm.creator = wxNickName || realname || username
        this.postForm.creatorHead = creatorHead
      }
      this.$refs.postForm.validate((valid, result) => {
        if (valid) {
          this.loading = true
          console.log(this.postForm)
          const api = this.isEdit ? updateArticle : createArticle
          const text = this.isEdit ? '修改' : '发布'
          api(this.postForm).then(resp => {
            this.$notify({
              title: '成功',
              message: `${text}文章成功`,
              type: 'success',
              duration: 2000
            })
            this.delStorage('articles', this.postForm.id)
            this.$router.replace('/article/list')
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
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
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
      this.setStorage('articles', data)
      this.$message({
        message: '已存入草稿箱',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.$router.replace('/article/list?isDraft=true')
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
