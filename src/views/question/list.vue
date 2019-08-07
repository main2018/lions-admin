<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :default-sort="{prop: 'createAt', order: 'descending'}"
    >
      <el-table-column
        align="center"
        type="index"
        width="50"
      >
      </el-table-column>
      <el-table-column align="center" label="ID" width="210">
        <template slot-scope="scope">
          <span>{{ scope.row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" label="标题">
        <template slot-scope="{row}">
          <span v-if="row.status === 1">{{ row.title }}</span>
          <router-link v-else :to="'/question/edit/'+row._id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="发布时间" prop="createAt" sortable>
        <template slot-scope="scope">
          <span>{{ scope.row.createAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column width="100px" label="Importance">
        <template slot-scope="scope">
          <svg-icon v-for="n in +scope.row.importance" :key="n" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column> -->

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ ['待解决', '已解决'][row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="创建者">
        <template slot-scope="scope">
          <span>{{ scope.row.user && scope.row.user[0] && scope.row.user[0].username }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="头像">
        <template slot-scope="scope">
          <span class="avatar" :style="{backgroundImage: `url(${scope.row.user && scope.row.user[0] && scope.row.user[0].headImgUrl})`}"></span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <router-link :to="scope.row.status === 1 ? '' : '/question/edit/'+scope.row._id">
            <el-button type="primary" size="small" icon="el-icon-edit" :disabled="scope.row.status === 1">
              编辑
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :page-sizes="pageSizes" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { fetchQuestions } from '@/api/question'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'QuestionList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  computed: {
    pageSizes() {
      const arr = Array(5).fill(0)
      return arr.map((item, index) => {
        return this.listQuery.pageSize * (index + 1)
      })
    }
  },
  created() {
    this.getList()
    console.log('pageSizes', this.pageSizes)
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchQuestions(this.listQuery).then(response => {
        this.list = response.data.article
        this.total = response.data.sum
        this.listLoading = false
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
  top: 10px;
}
</style>
