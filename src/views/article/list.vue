<template>
  <div class="app-container">
    <div class="app-container-header">
      <el-checkbox v-model="isDraft">草稿箱</el-checkbox>
    </div>
    <el-table
      v-loading="listLoading"
      :data="isDraft ? drafts : list"
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
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" label="标题">
        <template slot-scope="{row}">
          <router-link :to="'/article/edit/'+row.id + (isDraft ? '?isDraft=true' : '')" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="发布时间" prop="createAt" sortable>
        <template slot-scope="scope">
          <span>{{ scope.row.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
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
            {{ statusArr[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="作者">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <router-link :to="'/article/edit/'+scope.row.id + (isDraft ? '?isDraft=true' : '')">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0 && !isDraft" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { fetchList } from '@/api/article'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'ArticleList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '-1': 'info',
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      isDraft: Boolean(this.$route.query.isDraft),
      list: null,
      drafts: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  computed: {
    statusArr() {
      const arr = ['未发布', '发布', '删除']
      arr[-1] = '草稿'
      return arr
    }
  },
  created() {
    console.log('isDraft', this.isDraft)
    this.getList()
    this.drafts = this.getDraft()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total || 0
        this.listLoading = false
      })
    },
    getDraft() {
      const list = JSON.parse(localStorage.getItem('articles') || '[]')
      console.log('getDraft', list)
      return list
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
.app-container-header{
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
}
</style>
