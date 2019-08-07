<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="users" style="width: 100%;margin-top:30px;" border height="80vh">
      <el-table-column align="center" label="用户名" width="150" prop="username">
      </el-table-column>
      <el-table-column align="center" label="性别" width="150" prop="sex" :formatter="formatterSex">
      </el-table-column>
      <el-table-column align="center" label="真实姓名" width="150" prop="realname">
      </el-table-column>
      <el-table-column align="center" label="昵称" width="150" prop="nickname">
      </el-table-column>
      <el-table-column align="header-center" label="创建时间" width="200" prop="createdAt">
      </el-table-column>
      <el-table-column align="header-center" label="ID" prop="id">
      </el-table-column>
      <el-table-column align="center" label="操作" width="250" fixed="right">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button :type="['danger', 'warning'][scope.row.status]" size="small" @click="handleToggle(scope)">{{ ['禁用', '启用'][scope.row.status] }}</el-button>
          <el-button type="success" size="small" @click="handleRole(scope)">分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogVisible" title="选择角色">
      <el-select v-model="roleIds" multiple placeholder="选择一个角色">
        <el-option
          v-for="item in roles"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false; handleChangeRole()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="editUser" title="编辑用户" :rules="rulesUser">
      <el-form :model="user" label-width="80px" label-position="right">
        <el-form-item label="真实姓名" prop="realname">
          <el-input v-model="user.realname"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="user.nickname" prop="nickname"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="user.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUser = false">取 消</el-button>
        <el-button type="primary" @click="editUser = false; handleUpdate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, updateUser, userRole, getUserRole } from '@/api/user'
import { getRoles } from '@/api/role'

export default {
  data() {
    return {
      loading: false,
      updateUser,
      users: [],
      roles: [],
      dialogVisible: false,
      userId: '',
      roleIds: [],
      editUser: false,
      user: {
        id: '',
        realname: '',
        nickname: '',
        sex: 0
      },
      rulesUser: {
        realname: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
  },
  async created() {
    const users = await getUsers()
    this.users = users && users.data || []

    const roles = await getRoles()
    this.roles = roles.data || []
    console.log('users', this.users)
  },
  methods: {
    formatterSex(row, column, cellValue) {
      return ['未知', '男', '女'][cellValue || 0]
    },
    handleUpdate() {
      updateUser('', this.user).then(res => {
        this.$notify.success({
          title: '成功',
          message: `修改成功`
        })
        const index = this.users.findIndex(user => user.id === this.user.id)
        this.users.splice(index, 1, res.data)
      })
    },
    handleChangeRole() {
      userRole(this.userId, this.roleIds).then(res => {
        this.$notify.success({
          title: '成功',
          message: `角色分配成功`
        })
      })
    },
    handleEdit(scope) {
      const user = scope.row || {}
      for (const key in this.user) this.user[key] = user[key]
      this.editUser = true
    },
    handleToggle(scope) {
      const { id: userId, status: sta } = scope.row || {}
      const status = Number(!sta)
      updateUser(userId, { status }).then(res => {
        this.$notify.success({
          title: '成功',
          message: `${['启用', '禁用'][status]}成功`
        })
        const index = this.users.findIndex(user => user.id === userId)
        this.users.splice(index, 1, res.data)
      })
    },
    handleRole(scope) {
      this.loading = true
      const userId = scope.row.id
      this.userId = userId
      getUserRole(userId).then(res => {
        this.loading = false
        this.dialogVisible = true
        const roles = res.data || []
        const roleIds = roles.map(role => role.id)
        this.roleIds = roleIds
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
