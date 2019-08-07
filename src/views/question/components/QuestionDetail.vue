<template>
  <div class="app-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container" label-width="50px" label-position="left">
      <el-form-item label-width="0" prop="categoryId">
        <el-select v-model="postForm.categoryId" placeholder="请选择问题类别" style="margin-right: 20px">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-radio-group v-model="postForm.status">
          <el-radio :label="0">待解决</el-radio>
          <el-radio :label="1">已解决</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="postForm.title" placeholder="请填写标题"></el-input>
      </el-form-item>
      <el-form-item style="margin-bottom: 20px;" label="描述" prop="content">
        <el-input v-model="postForm.content" type="textarea" :rows="4" resize="none" placeholder="请填写描述"></el-input>
      </el-form-item>
      <el-form-item label="标签" prop="tag">
        <el-input v-model="postForm.tag" placeholder="请填写标签（多个标签以逗号隔开）"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-loading="loading" type="primary" @click="submit">{{ isEdit ? '修改' : '提交' }}</el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getCategory } from '@/api/category'
import { createQuestion, updateQuestion, fetchQuestion } from '@/api/question'
import { getUser } from '@/utils/auth'

const defaultForm = {
  title: '', // 标题
  content: '', // 补充
  categoryId: '', // 问题类别ID,
  tag: '', // 问题标签
  status: 0 // 0 待解决 1 已解决
}

export default {
  name: 'QuestionDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      postForm: Object.assign({}, defaultForm),
      rules: {
        title: [{ required: true, message: '文章标题必填' }],
        content: [{ required: true, message: '请填写文章内容' }],
        categoryId: [{ required: true, message: '请选择文章类别', trigger: 'blur' }]
      },
      categories: [],
      loading: false,
      tempRoute: {}
    }
  },
  computed: {
    options() {
      if (!this.categories) return []
      return this.categories.map(item => ({
        value: item._id,
        label: item.name
      }))
    },
    user() {
      return getUser()
    }
  },
  async created() {
    const categories = await getCategory(true)
    this.categories = categories && categories.data
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }

    this.tempRoute = Object.assign({}, this.$route)
    console.log('user', this.user)
  },
  methods: {
    fetchData(id) {
      fetchQuestion(id).then(response => {
        this.postForm = response.data

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
      const title = '编辑问题'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.title}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = '编辑问题'
      document.title = `${title} - ${this.postForm.title}`
    },
    submit() {
      this.$refs.postForm.validate((valid, result) => {
        if (valid) {
          this.loading = true
          const api = this.isEdit ? updateQuestion : createQuestion
          const text = this.isEdit ? '修改' : '创建'
          if (!this.isEdit) this.postForm.creator = this.user._id
          console.log('postForm', this.postForm)
          api(this.postForm).then(resp => {
            this.$notify({
              title: '成功',
              message: `${text}问题成功`,
              type: 'success',
              duration: 2000
            })
            this.$router.replace('/question/list')
          }).finally(() => { this.loading = false })
        } else {
          const message = ((Object.values(result)[0] || [])[0] || {}).message || '您有未填写的字段'
          this.$message.error(message)
          return false
        }
      })
    }
  }
}
</script>

