<template>
  <div class="edit-question">
    <question-detail :is-edit="true" />
    <el-table v-loading="loading" :data="answers" border fit highlight-current-row style="margin: 20px; ">
      <el-table-column width="120px" align="center" label="">
        <template slot-scope="scope">
          <span class="avatar" :style="{backgroundImage: `url(${scope.row.user && scope.row.user[0] && scope.row.user[0].headImgUrl})`}"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="回答者" width="150" prop="creatorName">
      </el-table-column>
      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="详情">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.content" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              cancel
            </el-button>
          </template>
          <span v-else>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-radio v-model="row.status" :label="0">一般答案</el-radio>
            <el-radio v-model="row.status" :label="1">满意答案</el-radio>
          </template>
          <span v-else>{{ row.status }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="small"
            icon="el-icon-circle-check-outline"
            @click="confirmEdit(row)"
          >
            Ok
          </el-button>
          <el-button
            v-else
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button
      type="success"
      size="small"
      icon="el-icon-plus"
      style="margin: 20px; float: right;"
      @click="addAnswer"
    >
      新增答案
    </el-button>
  </div>
</template>

<script>
import QuestionDetail from './components/QuestionDetail'
import { fetchAnswers, createAnswer, updateAnswer } from '@/api/question'
import { getUser } from '@/utils/auth'

export default {
  name: 'EditQuestion',
  components: { QuestionDetail },
  data() {
    return {
      loading: false,
      answers: []
    }
  },
  computed: {
    user() {
      return getUser()
    }
  },
  created() {
    this.getAnswers()
  },
  methods: {
    async getAnswers() {
      const pId = this.$route.params && this.$route.params.id
      let answers = await fetchAnswers(pId)
      answers = answers.data && answers.data.answer || []
      this.answers = answers.map(v => {
        this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
        v.originalContent = v.content //  will be used when user click the cancel botton
        v.originalStatus = v.status
        return v
      })
    },
    addAnswer() {
      this.$prompt('请输入您的回答', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: '',
        inputPattern: /\S/,
        inputErrorMessage: '答案不能为空'
      }).then(({ value }) => {
        const pId = this.$route.params && this.$route.params.id
        const data = {
          pId,
          content: value,
          creator: this.user && this.user._id
        }
        createAnswer(data).then(() => {
          this.$message({
            type: 'success',
            message: '新增答案成功'
          })
        })
        this.getAnswers()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    cancelEdit(row) {
      row.content = row.originalContent
      row.status = row.originalStatus
      row.edit = false
      this.$message({
        message: '已还原为原始值',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      const data = {
        _id: row._id,
        content: row.content,
        status: row.status
      }
      updateAnswer(data).then(() => {
        row.edit = false
        row.originalContent = row.content
        row.originalStatus = row.status
        this.$message({
          message: '修改成功',
          type: 'success'
        })
      })
    }
  }
}
</script>
<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 49%;
  transform: translateY(-50%);
}
</style>

