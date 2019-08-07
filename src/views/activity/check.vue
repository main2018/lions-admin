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
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" label="标题">
        <template slot-scope="{row}">
          <span class="activity-title" @click="catActivity(row.id)">{{ row.title }}</span>
          <!-- <router-link :to="'/activity/edit/'+row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link> -->
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

      <el-table-column align="center" label="Actions" width="250">
        <template slot-scope="scope">
          <el-button type="info" size="small" @click="catActivity(scope.row.id)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="changeStatus(scope.row.id, 1)">
            通过
          </el-button>
          <el-button type="warning" size="small" @click="changeStatus(scope.row.id, 3)">
            不通过
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog title="活动详情" :visible.sync="dialogTableVisible" fullscreen>
      <div v-if="activity" class="activity">
        <img :src="generateImg(activity)" alt="">
        <h3>{{ activity.title }}</h3>
        <div class="split"></div>
        <div class="activity-content">
          <div class="activity-content-item">
            活动人数
            <span>{{ activity.limitNum || 0 }}人</span>
          </div>
          <div class="activity-content-item">
            报名截止
            <span>{{ activity.regEndDate.split(' ')[0] }}</span>
          </div>
          <div class="activity-content-item">
            活动时间
            <span>{{ activity.startDate.split(' ')[0] }} ~ {{ activity.endDate.split(' ')[0] }}</span>
          </div>
          <div class="activity-content-item">
            活动人数
            <span>{{ activity.limitNum || 0 }}</span>
          </div>
        </div>
        <div class="split"></div>
        <div class="activity-detail" v-html="activity.details"></div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, updateActivity } from '@/api/activity'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { qiniuDomain } from '~/config/qiniu'

export default {
  name: 'ActivityList',
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
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        status: 0
      },
      dialogTableVisible: false,
      activity: null
    }
  },
  computed: {
    statusArr() {
      const arr = ['待审核', '发布', '删除']
      return arr
    }
  },
  created() {
    this.getList()
  },
  methods: {
    generateImg(activity) {
      const urls = activity.urls || []
      return urls[0] && urls[0].url ? qiniuDomain + urls[0].url : ''
    },
    catActivity(id) {
      const activity = (this.list || []).find(item => item.id === id)
      this.activity = activity
      this.dialogTableVisible = true
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list || []
        this.total = response.data.total || 0
        this.listLoading = false
      })
    },
    changeStatus(id, status) {
      const activity = this.list.find(item => item.id === id) || {}

      updateActivity({ id, status, urls: JSON.stringify(activity.urls || '') }).then(() => {
        this.$message.success('成功')
        this.getList()
      })
    }
  }
}
</script>

<style lang="scss">
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

.activity-title{
  color: blue;
  cursor: pointer;
}
.split{
  height: 10px;
  background-color: #eee;
}
.activity{
  img{
    width: 100%;
  }
  &-content{
    margin: 20px 0;
    &-item{
      padding: 10px 0;
      border-bottom: 1px solid #ccc;
      span{
        float: right;
      }
    }
  }
  &-detail{
    line-height: 2;
    img{
      width: 100%;
    }
  }
}
</style>
